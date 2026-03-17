/**
 * Controller: Pedidos
 * Conecta OrderService à View via React Query.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/core/services";
import type { CreateOrderDTO, UpdateOrderStatusDTO } from "@/core/dto";

const QUERY_KEYS = {
  orders: ["orders"],
  order: (id: string) => ["order", id] as const,
  ordersByCustomer: (customerId: string) => ["orders", "customer", customerId] as const,
} as const;

export function useOrders() {
  return useQuery({
    queryKey: QUERY_KEYS.orders,
    queryFn: () => orderService.getAll(),
  });
}

export function useOrdersByCustomer(customerId: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.ordersByCustomer(customerId ?? ""),
    queryFn: async () => {
      if (!customerId) return [];
      return orderService.getByCustomerId(customerId);
    },
    enabled: !!customerId && (options?.enabled !== false),
  });
}

export function useOrder(id: string | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.order(id ?? ""),
    queryFn: async () => {
      if (!id) throw new Error("Order ID required");
      const order = await orderService.getById(id);
      if (!order) throw new Error("Order not found");
      return order;
    },
    enabled: !!id && (options?.enabled !== false),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrderDTO) => orderService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders }),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateOrderStatusDTO) => orderService.updateStatus(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders }),
  });
}
