/**
 * DTOs para Settings (configurações)
 */

export interface SettingsDTO {
  taxa_entrega: string;
  tempo_estimado_minutos: string;
  [key: string]: string;
}

export interface UpdateSettingDTO {
  key: string;
  value: string;
}
