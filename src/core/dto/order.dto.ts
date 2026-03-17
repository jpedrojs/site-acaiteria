/**
 * DTOs para entidade Order
 */

export type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled";

export interface OrderItemDTO {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  toppings: string[] | null;
}

export interface OrderDTO {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  status: OrderStatus;
  total: number;
  observations: string | null;
  endereco_entrega: string | null;
  tipo: "retirada" | "entrega";
  taxa_entrega: number;
  tempo_estimado_minutos: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrderWithItemsDTO extends OrderDTO {
  order_items: OrderItemDTO[];
}

export interface CreateOrderItemDTO {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  toppings?: string[];
}

export interface CreateOrderDTO {
  customer_name: string;
  customer_id?: string;
  customer_phone?: string;
  total: number;
  observations?: string;
  endereco_entrega?: string;
  tipo?: "retirada" | "entrega";
  taxa_entrega?: number;
  tempo_estimado_minutos?: number;
  items: CreateOrderItemDTO[];
}

export interface UpdateOrderStatusDTO {
  id: string;
  status: OrderStatus;
  order?: {
    customer_name: string;
    customer_phone: string | null;
    total: number;
  };
}
