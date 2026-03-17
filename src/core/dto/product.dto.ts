/**
 * DTOs para entidade Product
 */

export interface ProductDTO {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  active: boolean;
  created_at: string;
}

export interface CreateProductDTO {
  name: string;
  price?: number;
  category?: string;
  description?: string;
  active?: boolean;
}

export interface UpdateProductDTO {
  id: string;
  name?: string;
  price?: number;
  category?: string;
  description?: string;
  active?: boolean;
}
