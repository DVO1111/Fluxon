-- Add user_id columns to link wallets and trades to authenticated users
ALTER TABLE public.wallet_balances
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.trades
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_wallet_balances_user_id ON public.wallet_balances(user_id);
CREATE INDEX idx_trades_user_id ON public.trades(user_id);

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view wallet balances" ON public.wallet_balances;
DROP POLICY IF EXISTS "Anyone can insert their wallet balance" ON public.wallet_balances;
DROP POLICY IF EXISTS "Anyone can update their wallet balance" ON public.wallet_balances;
DROP POLICY IF EXISTS "Users can view their own trades" ON public.trades;
DROP POLICY IF EXISTS "Users can insert their own trades" ON public.trades;

-- Create secure RLS policies for wallet_balances
CREATE POLICY "Users can view their own wallet balances"
ON public.wallet_balances
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet balance"
ON public.wallet_balances
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet balance"
ON public.wallet_balances
FOR UPDATE
USING (auth.uid() = user_id);

-- Create secure RLS policies for trades
CREATE POLICY "Users can view their own trades"
ON public.trades
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades"
ON public.trades
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create a profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Create trigger for profile updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create profile and wallet balance for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  INSERT INTO public.wallet_balances (user_id, usdt_balance, sol_balance)
  VALUES (NEW.id, 100000.00, 0.00);
  RETURN NEW;
END;
$$;

-- Create trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();