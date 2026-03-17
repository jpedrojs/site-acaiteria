/**
 * Service: Lógica de negócio para configurações.
 * Orquestra o repository.
 */

import { settingsRepository } from "@/core/repositories";
import type { SettingsDTO, UpdateSettingDTO } from "@/core/dto";

export const settingsService = {
  async getAll(): Promise<SettingsDTO> {
    return settingsRepository.findAll();
  },

  async update(dto: UpdateSettingDTO): Promise<void> {
    return settingsRepository.upsert(dto);
  },
};
