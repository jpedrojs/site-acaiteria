/**
 * Repository: Acesso a dados de produtos.
 * Responsabilidade única: operações CRUD no Supabase.
 */

import { supabase } from "@/integrations/supabase/client";
import type { ProductDTO, CreateProductDTO, UpdateProductDTO } from "@/core/dto";

export const productRepository = {
  async findAll(activeOnly = true): Promise<ProductDTO[]> {
    let query = supabase.from("products").select("*").order("category").order("name");
    if (activeOnly) {
      query = query.eq("active", true);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as ProductDTO[];
  },

  async create(dto: CreateProductDTO): Promise<ProductDTO> {
    const { data, error } = await supabase.from("products").insert(dto).select().single();
    if (error) throw error;
    return data as ProductDTO;
  },

  async update(dto: UpdateProductDTO): Promise<ProductDTO> {
    const { id, ...updates } = dto;
    const { data, error } = await supabase.from("products").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data as ProductDTO;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  },
};
