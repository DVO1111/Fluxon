-- Update INSERT policy to allow creating wallet balances by wallet_address
DROP POLICY IF EXISTS "Users can insert own wallet balance" ON wallet_balances;

CREATE POLICY "Anyone can create wallet balance"
ON wallet_balances
FOR INSERT
WITH CHECK (wallet_address IS NOT NULL);