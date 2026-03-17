/**
 * Controller: Configurações
 * Conecta SettingsService à View via React Query.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/core/services";
import type { UpdateSettingDTO } from "@/core/dto";

const QUERY_KEY = ["settings"] as const;

export function useSettings() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => settingsService.getAll(),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateSettingDTO) => settingsService.update(dto),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
