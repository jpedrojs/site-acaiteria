/**
 * Service: Lógica de negócio para clientes.
 * Orquestra o repository e aplica regras de negócio.
 */

import { customerRepository } from "@/core/repositories";
import type { CustomerDTO, CreateCustomerDTO, UpdateCustomerDTO } from "@/core/dto";

export const customerService = {
  async getAll(): Promise<CustomerDTO[]> {
    return customerRepository.findAll();
  },

  async findByPhone(phone: string): Promise<CustomerDTO | null> {
    return customerRepository.findByPhone(phone);
  },

  async create(dto: CreateCustomerDTO): Promise<CustomerDTO> {
    if (!dto.name?.trim()) {
      throw new Error("Nome é obrigatório");
    }
    return customerRepository.create(dto);
  },

  async update(dto: UpdateCustomerDTO): Promise<CustomerDTO> {
    if (!dto.name?.trim()) {
      throw new Error("Nome é obrigatório");
    }
    return customerRepository.update(dto);
  },

  async delete(id: string): Promise<void> {
    return customerRepository.delete(id);
  },
};
