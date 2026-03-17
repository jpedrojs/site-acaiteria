# Arquitetura MVC - Açaí Flow

Este documento descreve a arquitetura em camadas (MVC) do sistema de pedidos.

---

## Visão geral

O sistema segue a arquitetura **MVC** (Model-View-Controller) adaptada para React/SPA:

| Camada | Responsabilidade | Localização |
|--------|-----------------|-------------|
| **View** | Interface do usuário (UI) | `src/pages/`, `src/components/` |
| **Controller** | Conecta View aos Services, gerencia estado React | `src/core/controllers/` |
| **Service** | Lógica de negócio | `src/core/services/` |
| **Repository** | Acesso a dados (Supabase) | `src/core/repositories/` |
| **DTO** | Objetos de transferência de dados | `src/core/dto/` |

---

## Fluxo de dados

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              VIEW (Pages/Components)                          │
│  NewOrderPage, PedirPage, OrdersPage, CustomersPage, ProductsPage, etc.       │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ usa
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTROLLER (Hooks)                                    │
│  useOrderController, useProductController, useCustomerController, etc.        │
│  - React Query (useQuery, useMutation)                                        │
│  - Invalidação de cache                                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ chama
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVICE (Lógica de negócio)                           │
│  orderService, productService, customerService, etc.                         │
│  - Validações                                                                 │
│  - Orquestração (ex: OrderService chama NotificationService)                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ usa
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REPOSITORY (Acesso a dados)                           │
│  orderRepository, productRepository, customerRepository, etc.                 │
│  - Operações CRUD no Supabase                                                 │
│  - Sem lógica de negócio                                                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        │ acessa
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (PostgreSQL)                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Estrutura de pastas

```
src/
├── core/                          # Camada de arquitetura
│   ├── dto/                       # Data Transfer Objects
│   │   ├── product.dto.ts
│   │   ├── customer.dto.ts
│   │   ├── order.dto.ts
│   │   ├── settings.dto.ts
│   │   └── index.ts
│   ├── repositories/              # Acesso a dados
│   │   ├── product.repository.ts
│   │   ├── customer.repository.ts
│   │   ├── order.repository.ts
│   │   ├── settings.repository.ts
│   │   └── index.ts
│   ├── services/                  # Lógica de negócio
│   │   ├── product.service.ts
│   │   ├── customer.service.ts
│   │   ├── order.service.ts
│   │   ├── settings.service.ts
│   │   ├── notification.service.ts
│   │   └── index.ts
│   ├── controllers/               # Hooks React (Controllers)
│   │   ├── useProductController.ts
│   │   ├── useCustomerController.ts
│   │   ├── useOrderController.ts
│   │   ├── useSettingsController.ts
│   │   └── index.ts
│   └── index.ts
├── pages/                         # Views
├── components/
├── integrations/                  # Supabase client
├── hooks/                         # useData re-exporta controllers (compatibilidade)
└── types/                         # Tipos de domínio (CartItem, etc.)
```

---

## Camadas em detalhe

### 1. DTO (Data Transfer Object)

Objetos tipados para transferência de dados entre camadas.

**Exemplos:**
- `CreateOrderDTO` – dados para criar pedido
- `OrderWithItemsDTO` – pedido com itens (retorno de queries)
- `UpdateProductDTO` – dados para atualizar produto

**Regras:**
- Sem lógica, apenas estrutura de dados
- Usados em todos os boundaries entre camadas

### 2. Repository

Responsabilidade única: **acesso a dados**.

- Chama Supabase diretamente
- Sem validações de negócio
- Retorna DTOs ou dados tipados

**Exemplo:**

```ts
// order.repository.ts
export const orderRepository = {
  async findAll(): Promise<OrderWithItemsDTO[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as OrderWithItemsDTO[];
  },
  // ...
};
```

### 3. Service

Responsabilidade: **lógica de negócio**.

- Usa repositories
- Validações (ex: nome obrigatório)
- Orquestração (ex: OrderService chama NotificationService ao mudar status)

**Exemplo:**

```ts
// order.service.ts
export const orderService = {
  async create(dto: CreateOrderDTO): Promise<OrderDTO> {
    if (!dto.customer_name?.trim()) throw new Error("Nome obrigatório");
    if (!dto.items?.length) throw new Error("Adicione itens");
    return orderRepository.create(dto);
  },
  async updateStatus(dto: UpdateOrderStatusDTO): Promise<OrderDTO> {
    const order = await orderRepository.updateStatus(dto.id, dto.status);
    if (dto.order?.customer_phone) {
      notificationService.sendOrderStatusNotification({...}).catch(() => {});
    }
    return order;
  },
};
```

### 4. Controller (Hook)

Responsabilidade: **conectar Service à View**.

- Usa React Query (useQuery, useMutation)
- Define query keys e invalidação
- Expõe `data`, `isLoading`, `mutate`, etc. para a View

**Exemplo:**

```ts
// useOrderController.ts
export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => orderService.getAll(),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateOrderStatusDTO) => orderService.updateStatus(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
  });
}
```

### 5. View (Page)

Responsabilidade: **renderizar UI e interação**.

- Usa controllers (hooks)
- Não chama services ou repositories diretamente
- Não contém lógica de negócio

**Exemplo:**

```tsx
// OrdersPage.tsx
export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  // ...
}
```

---

## Regras de dependência

```
View → Controller → Service → Repository → Supabase
```

- **View** não importa de Service ou Repository
- **Controller** não importa de Repository
- **Service** não importa de Controller
- **Repository** não importa de Service

---

## Adicionando nova funcionalidade

1. **DTOs** – Criar `*.dto.ts` em `core/dto/`
2. **Repository** – Criar `*.repository.ts` em `core/repositories/`
3. **Service** – Criar `*.service.ts` em `core/services/`
4. **Controller** – Criar `use*Controller.ts` em `core/controllers/`
5. **View** – Criar página ou componente que usa o controller

---

## Compatibilidade

O arquivo `src/hooks/useData.ts` re-exporta os controllers para manter compatibilidade com imports antigos:

```ts
// Antes
import { useOrders } from "@/hooks/useData";

// Depois (recomendado)
import { useOrders } from "@/core/controllers";
```

Ambos funcionam.
