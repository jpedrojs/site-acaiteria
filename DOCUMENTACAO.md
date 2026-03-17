# Documentação do Sistema - Açaí Flow

Sistema de pedidos online para açaiteria. Permite que clientes façam pedidos pela web e que a empresa gerencie pedidos, produtos e clientes.

---

## Índice

1. [Visão geral](#visão-geral)
2. [Stack tecnológica](#stack-tecnológica)
3. [Arquitetura MVC](#arquitetura-mvc)
4. [Pontos críticos](#pontos-críticos)
5. [Fluxos principais](#fluxos-principais)
6. [Banco de dados](#banco-de-dados)
7. [Variáveis de ambiente](#variáveis-de-ambiente)
8. [Integração de notificações](#integração-de-notificações)

> **Arquitetura detalhada:** Ver [docs/ARQUITETURA.md](docs/ARQUITETURA.md) para documentação completa da arquitetura MVC.

---

## Visão geral

O sistema possui dois fluxos principais:

- **Fluxo do cliente:** Acessa `/loja` (landing), pode **cadastrar-se** em `/cadastro` ou **pedir online** em `/pedir`. Ao pedir, pode buscar dados pelo telefone se já for cadastrado. Finaliza e acompanha em `/pedido/:id`.
- **Fluxo da empresa:** PDV em `/` para pedidos presenciais, lista de pedidos em `/pedidos`, cadastro de clientes em `/clientes`, gestão de produtos em `/produtos`.

---

## Stack tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui (Radix), Lucide icons |
| Estado/Data | TanStack React Query |
| Backend | Supabase (PostgreSQL, REST API, Realtime) |
| Roteamento | React Router v6 |

---

## Arquitetura MVC

O sistema segue arquitetura em camadas (MVC adaptado para React):

| Camada | Responsabilidade | Localização |
|--------|-----------------|-------------|
| **View** | Interface do usuário | `pages/`, `components/` |
| **Controller** | Conecta View aos Services | `core/controllers/` |
| **Service** | Lógica de negócio | `core/services/` |
| **Repository** | Acesso a dados | `core/repositories/` |
| **DTO** | Objetos de transferência | `core/dto/` |

```
src/
├── core/                    # Camada de arquitetura
│   ├── dto/                 # Data Transfer Objects
│   ├── repositories/       # Acesso a dados (Supabase)
│   ├── services/           # Lógica de negócio
│   └── controllers/        # Hooks React (Controllers)
├── pages/                   # Views
├── components/
├── integrations/supabase/
├── hooks/
│   └── useData.ts          # Re-export dos controllers (compatibilidade)
└── types/
```

**Fluxo:** View → Controller → Service → Repository → Supabase

---

## Pontos críticos

### 1. Criação de pedidos

**Arquivos:** `core/repositories/order.repository.ts` → `create`, `core/services/order.service.ts`

- Insere em `orders` e depois em `order_items` em duas operações.
- Se a inserção em `order_items` falhar, o pedido fica órfão. Considerar transação ou Edge Function no futuro.
- Validações no Service: `customer_name` e `items` obrigatórios.

### 2. Atualização de status e notificações

**Arquivos:** `core/services/order.service.ts` → `updateStatus`, `core/services/notification.service.ts`

- OrderService atualiza status via repository e chama NotificationService quando há `customer_phone`.
- Chamada de notificação é assíncrona; erros são ignorados.
- NotificationService: ponto de extensão para WhatsApp/SMS. Só envia se `VITE_ENABLE_NOTIFICATIONS=true`.

### 3. Supabase Realtime

**Arquivo:** `src/pages/OrderTrackingPage.tsx`

- Inscreve-se em `postgres_changes` na tabela `orders` com filtro `id=eq.{id}`.
- A tabela `orders` precisa estar na publicação `supabase_realtime` (migração).

### 4. Configurações (settings)

**Arquivos:** `core/repositories/settings.repository.ts`, `core/services/settings.service.ts`, `core/controllers/useSettingsController.ts`

- Tabela `settings` com chaves `taxa_entrega` e `tempo_estimado_minutos`.
- Usada em PedirPage e NewOrderPage para taxa e tempo estimado.

### 5. Produtos ativos vs. inativos

**Arquivos:** `core/services/product.service.ts` → `getActiveProducts` vs `getAllProducts`

- `getActiveProducts`: apenas `active = true` (loja e PDV).
- `getAllProducts`: todos os produtos (página de gestão).

### 6. Taxa de entrega

**Arquivo:** `src/pages/PedirPage.tsx`

- Lê `taxa_entrega` de `useSettings()` (SettingsService).
- Aplicada apenas quando `tipo === "entrega"`.

---

## Fluxos principais

### Fluxo do cliente (pedido online)

1. Acessa `/loja` (landing).
2. Opcionalmente: **Cadastrar-se** em `/cadastro` (nome, telefone, email, endereço).
3. Clica em **Pedir online** → vai para `/pedir`.
4. Adiciona produtos ao carrinho.
5. Se cadastrado: clica em "Já sou cadastrado" e busca por telefone para preencher dados.
6. Preenche nome, telefone, tipo (retirada/entrega).
7. Se entrega: endereço obrigatório, taxa aplicada.
8. Clica em "Finalizar Pedido".
9. Redirecionado para `/pedido/:id`.
10. Acompanha status em tempo real (Realtime).

### Fluxo da empresa (atendimento)

1. Acessa `/` (PDV).
2. Busca/seleciona cliente (opcional).
3. Adiciona produtos ao carrinho.
4. Finaliza pedido.
5. Em `/pedidos`, filtra por status e data.
6. Clica no pedido para ver detalhes.
7. Avança status: Pendente → Preparar → Pronto → Entregue.
8. Se houver telefone, notificação é disparada (quando integração estiver ativa).

### Fluxo de gestão de produtos

1. Acessa `/produtos`.
2. Em Configurações: edita taxa de entrega e tempo estimado.
3. Cria/edita/exclui produtos.
4. Produtos inativos não aparecem na loja nem no PDV.

---

## Banco de dados

### Tabelas principais

| Tabela | Descrição |
|--------|-----------|
| `customers` | Clientes (nome, telefone, email, endereço) |
| `products` | Produtos (nome, preço, categoria, active) |
| `orders` | Pedidos (cliente, status, total, tipo, endereço, taxa, tempo estimado) |
| `order_items` | Itens do pedido (produto, quantidade, preço) |
| `settings` | Configurações (taxa_entrega, tempo_estimado_minutos) |

### Status do pedido

- `pending` → Pendente
- `preparing` → Preparando
- `ready` → Pronto
- `delivered` → Entregue
- `cancelled` → Cancelado

### Migrações

- `20260315114550_*`: Criação inicial (customers, products, orders, order_items).
- `20260315120000_*`: Campos de entrega (endereco_entrega, tipo, taxa_entrega, customer_phone) + Realtime.
- `20260315130000_*`: tempo_estimado_minutos em orders + tabela settings.

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | Sim | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Sim | Chave anon/public do Supabase |
| `VITE_ENABLE_NOTIFICATIONS` | Não | `true` para ativar envio de notificações |

---

## Integração de notificações

Para conectar WhatsApp ou SMS:

1. Edite `src/core/services/notification.service.ts`.
2. Implemente a chamada real em `sendOrderStatusNotification` (ex.: fetch para backend ou API direta).
3. Configure `VITE_ENABLE_NOTIFICATIONS=true`.
4. Opções comuns:
   - **Twilio:** SMS e WhatsApp via API.
   - **WhatsApp Business API:** Oficial, requer aprovação.
   - **Evolution API:** WhatsApp não-oficial, self-hosted.
   - **Z-API, etc.:** Outras soluções de terceiros.

Exemplo de payload recebido pela função:

```ts
{
  orderId: string;
  customerName: string;
  customerPhone: string | null;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  statusLabel: string;
  total: number;
}
```

Mensagens por status estão em `STATUS_MESSAGES` no arquivo.
