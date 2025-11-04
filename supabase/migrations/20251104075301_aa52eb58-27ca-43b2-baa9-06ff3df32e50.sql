-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own wallet balance" ON public.wallet_balances;

-- Create new INSERT policy that allows wallet creation with wallet_address only
CREATE POLICY "Users can insert own wallet balance"
ON public.wallet_balances
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR
  (wallet_address IS NOT NULL)
);