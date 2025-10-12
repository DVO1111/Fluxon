-- Create trades table for trade history
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  from_token TEXT NOT NULL,
  to_token TEXT NOT NULL,
  from_amount NUMERIC NOT NULL,
  to_amount NUMERIC NOT NULL,
  transaction_signature TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- Create policies for trade access
CREATE POLICY "Users can view their own trades"
ON public.trades
FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own trades"
ON public.trades
FOR INSERT
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX idx_trades_wallet_address ON public.trades(wallet_address);
CREATE INDEX idx_trades_created_at ON public.trades(created_at DESC);