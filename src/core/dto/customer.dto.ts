/**
 * DTOs para entidade Customer
 */

export interface CustomerDTO {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerDTO {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerDTO {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}
