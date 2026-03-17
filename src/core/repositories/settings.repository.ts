/**
 * Repository: Acesso a dados de configurações.
 * Responsabilidade única: operações no Supabase.
 */

import { supabase } from "@/integrations/supabase/client";
import type { SettingsDTO, UpdateSettingDTO } from "@/core/dto";

export const settingsRepository = {
  async findAll(): Promise<SettingsDTO> {
    const { data, error } = await supabase.from("settings").select("*");
    if (error) throw error;
    const entries = (data ?? []).map((r: { key: string; value: string }) => [r.key, r.value]);
    return Object.fromEntries(entries) as SettingsDTO;
  },

  async upsert(dto: UpdateSettingDTO): Promise<void> {
    const { error } = await supabase
      .from("settings")
      .upsert({ key: dto.key, value: dto.value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw error;
  },
};
