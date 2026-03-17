/**
 * Repository: Acesso a dados de clientes.
 * Responsabilidade única: operações CRUD no Supabase.
 */

import { supabase } from "@/integrations/supabase/client";
import type { CustomerDTO, CreateCustomerDTO, UpdateCustomerDTO } from "@/core/dto";

export const customerRepository = {
  async findAll(): Promise<CustomerDTO[]> {
    const { data, error } = await supabase.from("customers").select("*").order("name");
    if (error) throw error;
    return data as CustomerDTO[];
  },

  async create(dto: CreateCustomerDTO): Promise<CustomerDTO> {
    const { data, error } = await supabase.from("customers").insert(dto).select().single();
    if (error) throw error;
    return data as CustomerDTO;
  },

  async update(dto: UpdateCustomerDTO): Promise<CustomerDTO> {
    const { id, ...updates } = dto;
    const { data, error } = await supabase.from("customers").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data as CustomerDTO;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) throw error;
  },

  async findByPhone(phone: string): Promise<CustomerDTO | null> {
    const normalized = phone.replace(/\D/g, "");
    if (!normalized.length) return null;
    const all = await this.findAll();
    return all.find((c) => {
      if (!c.phone) return false;
      const stored = c.phone.replace(/\D/g, "");
      return stored === normalized || stored.endsWith(normalized) || normalized.endsWith(stored);
    }) ?? null;
  },
};
