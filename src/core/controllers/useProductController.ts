/**
 * Controller: Produtos
 * Conecta ProductService à View via React Query.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/core/services";
import type { CreateProductDTO, UpdateProductDTO } from "@/core/dto";

const QUERY_KEYS = {
  products: ["products"],
  productsAll: ["products", "all"],
} as const;

export function useProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: () => productService.getActiveProducts(),
  });
}

export function useProductsAll() {
  return useQuery({
    queryKey: QUERY_KEYS.productsAll,
    queryFn: () => productService.getAllProducts(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDTO) => productService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productsAll });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateProductDTO) => productService.update(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productsAll });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productsAll });
    },
  });
}
