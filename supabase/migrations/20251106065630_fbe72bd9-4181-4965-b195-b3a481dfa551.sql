-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view own wallet balance" ON wallet_balances;

-- Create new policy that allows viewing wallet balance by wallet_address
CREATE POLICY "Anyone can view wallet balance by address"
ON wallet_balances
FOR SELECT
USING (wallet_address IS NOT NULL);

-- Update the UPDATE policy to be simpler and wallet-address based
DROP POLICY IF EXISTS "Users can update own wallet balance" ON wallet_balances;

CREATE POLICY "Anyone can update wallet by address"
ON wallet_balances
FOR UPDATE
USING (wallet_address IS NOT NULL)
WITH CHECK (wallet_address IS NOT NULL);