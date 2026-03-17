/**
 * Service: Lógica de negócio para produtos.
 * Orquestra o repository e aplica regras de negócio.
 */

import { productRepository } from "@/core/repositories";
import type { ProductDTO, CreateProductDTO, UpdateProductDTO } from "@/core/dto";

export const productService = {
  async getActiveProducts(): Promise<ProductDTO[]> {
    return productRepository.findAll(true);
  },

  async getAllProducts(): Promise<ProductDTO[]> {
    return productRepository.findAll(false);
  },

  async create(dto: CreateProductDTO): Promise<ProductDTO> {
    return productRepository.create({
      ...dto,
      category: dto.category ?? "açaí",
      active: dto.active ?? true,
    });
  },

  async update(dto: UpdateProductDTO): Promise<ProductDTO> {
    return productRepository.update(dto);
  },

  async delete(id: string): Promise<void> {
    return productRepository.delete(id);
  },
};
