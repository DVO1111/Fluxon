-- Make user_id nullable and allow wallet_address to be the primary identifier
ALTER TABLE wallet_balances ALTER COLUMN user_id DROP NOT NULL;

-- Add a unique constraint on wallet_address to prevent duplicates
ALTER TABLE wallet_balances DROP CONSTRAINT IF EXISTS wallet_balances_wallet_address_key;
ALTER TABLE wallet_balances ADD CONSTRAINT wallet_balances_wallet_address_key UNIQUE (wallet_address);