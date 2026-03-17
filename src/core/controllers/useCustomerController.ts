/**
 * Controller: Clientes
 * Conecta CustomerService à View via React Query.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/core/services";
import type { CreateCustomerDTO, UpdateCustomerDTO } from "@/core/dto";

const QUERY_KEY = ["customers"] as const;

export function useCustomers() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => customerService.getAll(),
  });
}

export function useSearchCustomerByPhone() {
  return useMutation({
    mutationFn: (phone: string) => customerService.findByPhone(phone),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCustomerDTO) => customerService.create(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateCustomerDTO) => customerService.update(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
