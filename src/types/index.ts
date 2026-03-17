/**
 * Tipos de domínio.
 * Product e Customer usam DTOs do core para consistência.
 */

import type { ProductDTO } from "@/core/dto";

export type Product = ProductDTO;
export type Customer = import("@/core/dto").CustomerDTO;
export type Order = import("@/core/dto").OrderDTO;
export type OrderItem = import("@/core/dto").OrderItemDTO;

export interface CartItem {
  product: Product;
  quantity: number;
  toppings: string[];
}
