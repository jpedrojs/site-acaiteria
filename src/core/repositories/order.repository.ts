/**
 * Repository: Acesso a dados de pedidos.
 * Responsabilidade única: operações CRUD no Supabase.
 */

import { supabase } from "@/integrations/supabase/client";
import type { OrderDTO, OrderWithItemsDTO, CreateOrderDTO } from "@/core/dto";

export const orderRepository = {
  async findAll(): Promise<OrderWithItemsDTO[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as OrderWithItemsDTO[];
  },

  async findById(id: string): Promise<OrderWithItemsDTO | null> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data as OrderWithItemsDTO;
  },

  async findByCustomerId(customerId: string): Promise<OrderWithItemsDTO[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as OrderWithItemsDTO[];
  },

  async create(dto: CreateOrderDTO): Promise<OrderDTO> {
    const { items, ...orderFields } = dto;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderFields)
      .select()
      .single();
    if (orderError) throw orderError;

    const orderItems = items.map((item) => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    return order as OrderDTO;
  },

  async updateStatus(id: string, status: string): Promise<OrderDTO> {
    const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().single();
    if (error) throw error;
    return data as OrderDTO;
  },
};
