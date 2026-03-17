/**
 * DTOs para entidade Produto (store merchandise)
 */

export interface ProdutoDTO {
  id: string;
  name: string;
  price: number;
  stock?: number;
  category: string;
  active: boolean;
  created_at: string;
}

export interface CreateProdutoDTO {
  name: string;
  price?: number;
  stock?: number;
  category?: string;
  active?: boolean;
}

export interface UpdateProdutoDTO {
  id: string;
  name?: string;
  price?: number;
  stock?: number;
  category?: string;
  active?: boolean;
}
