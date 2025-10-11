-- Drop the old user_balances table
DROP TABLE IF EXISTS public.user_balances;

-- Create wallet_balances table using wallet addresses
CREATE TABLE public.wallet_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  usdt_balance DECIMAL(20, 2) NOT NULL DEFAULT 100000.00,
  sol_balance DECIMAL(20, 9) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wallet_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow all authenticated users to read and manage their own wallet
CREATE POLICY "Anyone can view wallet balances"
ON public.wallet_balances
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can insert their wallet balance"
ON public.wallet_balances
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can update their wallet balance"
ON public.wallet_balances
FOR UPDATE
TO anon, authenticated
USING (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_wallet_balances_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_wallet_balances_updated_at
BEFORE UPDATE ON public.wallet_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_wallet_balances_timestamp();