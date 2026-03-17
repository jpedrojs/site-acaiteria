/**
 * DTOs para entidade CopoAcai
 */

export interface CopoAcaiDTO {
  id: string;
  size: string;
  base_price: number;
  active: boolean;
  created_at: string;
}

export interface CreateCopoAcaiDTO {
  size: string;
  base_price?: number;
  active?: boolean;
}

export interface UpdateCopoAcaiDTO {
  id: string;
  size?: string;
  base_price?: number;
  active?: boolean;
}
