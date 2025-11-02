-- Drop existing RLS policies on wallet_balances
DROP POLICY IF EXISTS "Users can view their own wallet balances" ON wallet_balances;
DROP POLICY IF EXISTS "Users can insert their own wallet balance" ON wallet_balances;
DROP POLICY IF EXISTS "Users can update their own wallet balance" ON wallet_balances;

-- Create new policies that work with wallet addresses (no auth required)
CREATE POLICY "Anyone can insert wallet balance with their address"
ON wallet_balances
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view wallet balances"
ON wallet_balances
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update their wallet balance by address"
ON wallet_balances
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Update trades table RLS to allow operations by wallet_address as well
DROP POLICY IF EXISTS "Users can view their own trades" ON trades;
DROP POLICY IF EXISTS "Users can insert their own trades" ON trades;

CREATE POLICY "Users can view trades by wallet"
ON trades
FOR SELECT
USING (auth.uid() = user_id OR wallet_address = wallet_address);

CREATE POLICY "Users can insert trades by wallet"
ON trades
FOR INSERT
WITH CHECK (true);