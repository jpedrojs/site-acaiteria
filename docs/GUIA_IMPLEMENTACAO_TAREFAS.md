# Guia de Implementação — 5 Tarefas

Este documento descreve as alterações necessárias para implementar as 5 tarefas solicitadas.

---

## ✅ Tarefa 3: Correção do Bug na Aba Produtos (CONCLUÍDA)

**Problema:** Hooks (`useState`, `useEffect`) eram chamados após um `return` condicional, violando as [Regras dos Hooks](https://react.dev/reference/rules/rules-of-hooks) do React.

**Solução aplicada:** Os hooks `localTaxa` e `localTempo` foram movidos para o topo do componente, antes do `if (isLoading)`.

**Arquivo alterado:** `src/pages/ProductsPage.tsx`

---

## 1. Refatoração da Estrutura do Pedido (Copo + Ingredientes Nested)

### Situação Atual
- `order_items` armazena cada item (açaí ou complemento) no mesmo nível.
- `toppings` é um array de strings no item.
- Não há distinção clara entre "copo de açaí" e "ingredientes do copo".

### Comportamento Esperado
- Um **copo de açaí** é o produto principal.
- Os **ingredientes** (complementos) ficam aninhados dentro do objeto do copo.
- Máximo de **3 ingredientes por copo**.

### Alterações Necessárias

#### 1.1 Banco de Dados (Schema)

**Opção A — Manter `order_items` e adicionar `parent_item_id` (recomendado):**

Criar migration `supabase/migrations/YYYYMMDDHHMMSS_order_items_nested.sql`:

```sql
-- Adiciona coluna para vincular ingredientes ao copo pai
ALTER TABLE public.order_items
ADD COLUMN parent_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE;

-- Índice para consultas por parent
CREATE INDEX idx_order_items_parent ON public.order_items(parent_item_id);

-- Constraint: ingredientes (parent_item_id NOT NULL) não podem ter filhos
-- (opcional, via trigger ou validação no backend)
```

**Estrutura lógica:**
- Item com `parent_item_id = NULL` → copo de açaí (produto principal).
- Item com `parent_item_id = <id>` → ingrediente do copo referenciado.

**Opção B — Nova tabela `order_item_toppings`:**

```sql
CREATE TABLE public.order_item_toppings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0
);
```

#### 1.2 DTOs (`src/core/dto/order.dto.ts`)

```typescript
// Item de copo com ingredientes aninhados
export interface OrderItemDTO {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  toppings: string[] | null;  // manter por compatibilidade ou migrar
  parent_item_id?: string | null;  // se Opção A
  ingredients?: OrderItemDTO[];    // nested (carregado via join/query)
}

// Para criação — copo com ingredientes
export interface CreateOrderCopoDTO {
  product_id: string;      // id do açaí (300ml, 500ml, etc)
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  ingredients: CreateOrderIngredienteDTO[];  // max 3
}

export interface CreateOrderIngredienteDTO {
  product_id: string;
  product_name: string;
  unit_price: number;
}
```

#### 1.3 Validação — Máximo 3 Ingredientes

**Frontend** (`NewOrderPage.tsx`, `PedirPage.tsx`):

- Ao adicionar complemento a um copo no carrinho, verificar `toppings.length < 3`.
- Exibir toast: "Máximo de 3 ingredientes por copo".

**Backend** (`order.service.ts`):

```typescript
// No create():
for (const item of dto.items) {
  const ingredientsCount = item.ingredients?.length ?? item.toppings?.length ?? 0;
  if (ingredientsCount > 3) {
    throw new Error(`O copo "${item.product_name}" excede o limite de 3 ingredientes`);
  }
}
```

#### 1.4 Fluxo de Carrinho (Frontend)

**Modelo atual:** `CartItem` = `{ product, quantity, toppings: string[] }`.

**Modelo desejado:** Cada item de açaí no carrinho deve ter seus ingredientes vinculados.

- Ao adicionar **açaí** → novo `CartItem` com `toppings: []`.
- Ao adicionar **complemento** → o usuário deve escolher a qual copo associar (ou o último adicionado).
- Validação: `toppings.length <= 3`.

**Arquivos a alterar:**
- `src/types/index.ts` — manter `CartItem` com `toppings`, mas garantir que só complementos de açaí entrem ali.
- `src/components/CartItemRow.tsx` — exibir ingredientes do copo; permitir adicionar/remover até 3.
- `src/pages/NewOrderPage.tsx` e `PedirPage.tsx` — lógica de `addToCart` para complementos: associar ao copo, não como item separado.

---

## 2. Select (Dropdown) para Status do Pedido

### Situação Atual
- Botões "Preparar", "Pronto", "Entregue", "Cancelar" — um clique altera o status.
- Risco de cliques acidentais.

### Comportamento Esperado
- Substituir por um **Select** (dropdown).
- Usuário escolhe explicitamente o novo status na lista.

### Alterações

**Arquivo:** `src/pages/OrdersPage.tsx`

**Substituir o bloco de botões (linhas ~174–199) por:**

```tsx
<div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
  <Select
    value={order.status}
    onValueChange={(newStatus) => handleStatusClick(order, newStatus)}
    disabled={updateStatus.isPending || order.status === "delivered" || order.status === "cancelled"}
  >
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Alterar status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="pending">Pendente</SelectItem>
      <SelectItem value="preparing">Preparando</SelectItem>
      <SelectItem value="ready">Pronto</SelectItem>
      <SelectItem value="delivered">Entregue</SelectItem>
      <SelectItem value="cancelled">Cancelado</SelectItem>
    </SelectContent>
  </Select>
</div>
```

- Ajustar `handleStatusClick` para aceitar qualquer status (não apenas `cfg.next`).
- O `Select` já está importado em `OrdersPage.tsx`.

---

## 4. Badge de Entrega/Retirada no Detalhe do Pedido

### Comportamento Esperado
- No topo da tela de detalhes do pedido, exibir um **Badge** ou **Tag** bem visível: "Entrega" ou "Retirada".

### Alterações

**Arquivo:** `src/pages/OrdersPage.tsx`

**No Dialog de detalhes** (após `DialogHeader`), adicionar no topo do conteúdo:

```tsx
<Badge
  className={
    detailOrder.tipo === "entrega"
      ? "bg-primary text-primary-foreground text-sm px-3 py-1"
      : "bg-secondary text-secondary-foreground text-sm px-3 py-1"
  }
>
  {detailOrder.tipo === "entrega" ? "🚚 Entrega" : "🏪 Retirada"}
</Badge>
```

**Na lista de cards** (opcional): adicionar um pequeno badge ao lado do nome do cliente para identificação rápida.

---

## ✅ Tarefa 5: Histórico de Pedidos do Cliente (IMPLEMENTADA)

### Comportamento Esperado
- Na área de pesquisa de clientes (`CustomersPage`), ao clicar em "Histórico" de um cliente, exibir a lista de pedidos daquele cliente.

### Implementação Realizada

- **`order.repository.ts`:** método `findByCustomerId(customerId)`
- **`order.service.ts`:** método `getByCustomerId(customerId)`
- **`useOrderController.ts`:** hook `useOrdersByCustomer(customerId)`
- **`CustomersPage.tsx`:** botão "Histórico" em cada cliente; Dialog com lista de pedidos (data, status, itens resumidos, total)

**Nota:** Apenas pedidos com `customer_id` preenchido aparecem no histórico. Pedidos feitos sem vincular o cliente cadastrado (ex.: na loja online sem login) não serão listados.

---

## Resumo de Arquivos por Tarefa

| Tarefa | Arquivos | Status |
|--------|----------|--------|
| 1. Estrutura do pedido | `supabase/migrations/`, `order.dto.ts`, `order.repository.ts`, `order.service.ts`, `NewOrderPage.tsx`, `PedirPage.tsx`, `CartItemRow.tsx`, `types/index.ts` | Pendente |
| 2. Select de status | `OrdersPage.tsx` | ✅ Implementado |
| 3. Bug Produtos | `ProductsPage.tsx` | ✅ Corrigido |
| 4. Badge Entrega/Retirada | `OrdersPage.tsx` | ✅ Implementado |
| 5. Histórico do cliente | `order.repository.ts`, `order.service.ts`, `useOrderController.ts`, `CustomersPage.tsx` | ✅ Implementado |

---

## Ordem Sugerida de Implementação

1. **Tarefas 2, 3, 4, 5** — ✅ Já implementadas/corrigidas.
2. **Tarefa 1** — Refatoração do pedido (mais complexa, exige migração e ajustes em várias telas).
