-- Fix RLS policies for wallet_balances to prevent unauthorized access
-- Users should only be able to view and update their own wallet balance based on wallet_address

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view wallet balances" ON public.wallet_balances;
DROP POLICY IF EXISTS "Anyone can update their wallet balance by address" ON public.wallet_balances;
DROP POLICY IF EXISTS "Anyone can insert wallet balance with their address" ON public.wallet_balances;

-- Create secure policies that restrict access to wallet owner only
-- For wallet-based access (no auth), we'll use a custom claim in JWT that must be set by an edge function
-- For now, we'll use user_id when available, and wallet_address for wallet-only mode

CREATE POLICY "Users can view own wallet balance"
ON public.wallet_balances
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
);

CREATE POLICY "Users can insert own wallet balance"
ON public.wallet_balances
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND wallet_address IS NOT NULL)
);

CREATE POLICY "Users can update own wallet balance"
ON public.wallet_balances
FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
)
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (auth.uid() IS NULL AND wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
);