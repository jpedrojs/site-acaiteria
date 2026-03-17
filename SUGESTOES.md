# Sugestões de Melhoria - Açaí Flow

Este documento lista as sugestões de melhoria para o sistema de pedidos da açaiteria, com o status de implementação de cada item.

---

## ✅ Implementado

### 1. Página pública de pedidos para o cliente

- **Status:** ✅ Implementado
- **Descrição:** Rota pública onde o cliente escolhe produtos, monta o pedido e finaliza.
- **Detalhes:**
  - Rota: `/pedir`
  - Catálogo de produtos (açaí e complementos)
  - Carrinho com alteração de quantidade e remoção
  - Checkout integrado na mesma página
  - Tela atual em `/` mantida como PDV interno para atendimento presencial
  - Link "Loja" no header interno para acessar a página pública

### 2. Endereço e tipo de entrega

- **Status:** ✅ Implementado
- **Descrição:** Campos para endereço de entrega, tipo (retirada/entrega) e taxa de entrega.
- **Detalhes:**
  - Novos campos em `orders`: `endereco_entrega`, `tipo`, `taxa_entrega`, `customer_phone`
  - Migração: `supabase/migrations/20260315120000_add_delivery_fields_to_orders.sql`
  - Na página `/pedir`: escolha entre Retirada ou Entrega
  - Se Entrega: campo de endereço obrigatório + taxa configurável
  - Se Retirada: sem endereço e sem taxa
  - Tela de pedidos da empresa (`/pedidos`) exibe endereço e taxa quando aplicável

### 3. Confirmação e acompanhamento para o cliente

- **Status:** ✅ Implementado
- **Descrição:** Tela de confirmação após finalizar o pedido e página de acompanhamento com status em tempo real.
- **Detalhes:**
  - Após finalizar em `/pedir`, redirecionamento para `/pedido/:id`
  - Página de acompanhamento com: status, itens, endereço (se entrega), total
  - **Supabase Realtime:** status do pedido atualiza automaticamente na tela do cliente
  - Cliente pode salvar o link para acompanhar o pedido em tempo real

### 4. Filtros e detalhes na tela de pedidos

- **Status:** ✅ Implementado
- **Descrição:** Filtrar pedidos por status e data; tela de detalhes do pedido.
- **Detalhes:**
  - Tabs por status: Todos, Pendente, Preparando, Pronto, Entregue
  - Filtro por período: Todos, Hoje, Últimos 3 dias, Última semana
  - Modal de detalhes ao clicar no pedido (itens, telefone, endereço, observações)

### 5. Gestão de produtos

- **Status:** ✅ Implementado
- **Descrição:** Interface para criar/editar produtos, preços e categorias.
- **Detalhes:**
  - Rota: `/produtos`
  - CRUD completo: criar, editar, excluir produtos
  - Categorias: Açaí e Complemento
  - Campo `active` para ativar/desativar na loja sem excluir

### 6. Tempo estimado

- **Status:** ✅ Implementado
- **Descrição:** Exibir tempo estimado de preparo/entrega (ex.: "15–25 min").
- **Detalhes:**
  - Campo `tempo_estimado_minutos` em `orders`
  - Valor configurável em Produtos > Configurações (padrão: 20 min)
  - Exibido na tela de pedidos, no modal de detalhes e na página de acompanhamento do cliente

### 7. Notificações (WhatsApp/SMS)

- **Status:** ✅ Infraestrutura implementada
- **Descrição:** Avisar o cliente sobre mudanças de status do pedido.
- **Detalhes:**
  - Serviço em `src/services/notifications.ts`
  - Chamado automaticamente ao mudar status do pedido (quando há `customer_phone`)
  - Para ativar: configurar `VITE_ENABLE_NOTIFICATIONS=true` e implementar integração real
  - Ver `DOCUMENTACAO.md` para instruções de integração com WhatsApp/Twilio

### 8. Taxa de entrega configurável

- **Status:** ✅ Implementado
- **Descrição:** Taxa de entrega configurável em vez de fixa no código.
- **Detalhes:**
  - Tabela `settings` com chave `taxa_entrega`
  - Editável em Produtos > Configurações
  - Padrão: R$ 5,00

---

## ⏳ Pendente / Sugestões futuras

### 9. Segurança e RLS

- **Status:** ⏳ Pendente
- **Descrição:** Políticas RLS adequadas e autenticação para área administrativa.
- **Sugestão:** Substituir `USING (true) WITH CHECK (true)` por políticas específicas; auth para `/`, `/pedidos`, `/clientes`, `/produtos`.

### 10. Integração real WhatsApp/SMS

- **Status:** ⏳ Pendente (infraestrutura pronta)
- **Descrição:** Conectar o serviço de notificações a uma API real.
- **Sugestão:** Twilio, WhatsApp Business API, Evolution API. Ver `src/services/notifications.ts`.

---

## Como aplicar as migrações

```bash
npx supabase db push
```

Ou aplique manualmente no SQL Editor do Supabase (ver arquivos em `supabase/migrations/`).

---

## Rotas do sistema

| Rota | Descrição | Público |
|------|-----------|---------|
| `/` | PDV interno - novo pedido | Não |
| `/loja` | **Landing do cliente** - Pedir online, Cadastrar-se, Acompanhar pedido | Sim |
| `/pedir` | Loja online - cliente monta e finaliza pedido | Sim |
| `/cadastro` | **Cadastro do cliente** - criar conta (nome, telefone, email, endereço) | Sim |
| `/pedido/:id` | Acompanhamento do pedido (tempo real) | Sim |
| `/pedidos` | Lista de pedidos (empresa) | Não |
| `/clientes` | Cadastro de clientes | Não |
| `/produtos` | Gestão de produtos e configurações | Não |
