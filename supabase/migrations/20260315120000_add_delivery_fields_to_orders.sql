-- Add delivery fields to orders table
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS endereco_entrega TEXT,
  ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'retirada' CHECK (tipo IN ('retirada', 'entrega')),
  ADD COLUMN IF NOT EXISTS taxa_entrega NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Enable Realtime for orders (status updates for customer tracking)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
