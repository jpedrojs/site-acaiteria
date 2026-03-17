# Core - Camada de Arquitetura MVC

Esta pasta contém a lógica de negócio e acesso a dados do sistema.

## Estrutura

```
core/
├── dto/           # Data Transfer Objects - tipos de dados entre camadas
├── repositories/  # Acesso a dados (Supabase)
├── services/      # Lógica de negócio
└── controllers/   # Hooks React que conectam services à View
```

## Regras

- **View** importa apenas de `controllers`
- **Controller** importa apenas de `services`
- **Service** importa apenas de `repositories` e outros `services`
- **Repository** importa apenas de `integrations/supabase` e `dto`

## Uso nas Pages

```tsx
import { useOrders, useUpdateOrderStatus } from "@/core/controllers";

export default function OrdersPage() {
  const { data: orders } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  // ...
}
```

Ver [docs/ARQUITETURA.md](../../docs/ARQUITETURA.md) para documentação completa.
