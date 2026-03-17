-- Add tempo_estimado_minutos to orders
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tempo_estimado_minutos INTEGER DEFAULT 20;

-- Create settings table for configurable values (taxa_entrega, tempo_estimado_default, etc.)
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Seed default settings
INSERT INTO public.settings (key, value) VALUES
  ('taxa_entrega', '5'),
  ('tempo_estimado_minutos', '20')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS for settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow full access to settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
