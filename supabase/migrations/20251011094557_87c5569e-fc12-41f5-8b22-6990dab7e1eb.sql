-- Create user_balances table for demo trading
CREATE TABLE public.user_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  usdt_balance DECIMAL(20, 2) NOT NULL DEFAULT 100000.00,
  sol_balance DECIMAL(20, 9) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own balance"
ON public.user_balances
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own balance"
ON public.user_balances
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own balance"
ON public.user_balances
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to create initial balance for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_balances (user_id, usdt_balance, sol_balance)
  VALUES (NEW.id, 100000.00, 0.00);
  RETURN NEW;
END;
$$;

-- Trigger to automatically create balance for new users
CREATE TRIGGER on_auth_user_created_balance
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_balance();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_user_balances_updated_at
BEFORE UPDATE ON public.user_balances
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();