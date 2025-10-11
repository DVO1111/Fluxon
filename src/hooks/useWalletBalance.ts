import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface WalletBalance {
  usdt_balance: number;
  sol_balance: number;
}

export const useWalletBalance = () => {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    if (!publicKey || !connected) {
      setBalance(null);
      setLoading(false);
      return;
    }

    try {
      const walletAddress = publicKey.toString();

      // Check if wallet balance exists
      let { data, error } = await supabase
        .from('wallet_balances')
        .select('usdt_balance, sol_balance')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      // If wallet doesn't exist, create it with 100k USDT
      if (!data && !error) {
        const { data: newBalance, error: insertError } = await supabase
          .from('wallet_balances')
          .insert({
            wallet_address: walletAddress,
            usdt_balance: 100000.00,
            sol_balance: 0.00,
          })
          .select('usdt_balance, sol_balance')
          .single();

        if (insertError) throw insertError;
        
        setBalance(newBalance);
        toast({
          title: 'Welcome to Fluxon!',
          description: 'You received 100,000 USDT demo balance',
        });
        return;
      }

      if (error) throw error;
      setBalance(data);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (usdtDelta: number, solDelta: number) => {
    if (!publicKey || !connected || !balance) return false;

    try {
      const walletAddress = publicKey.toString();
      const newUsdtBalance = balance.usdt_balance + usdtDelta;
      const newSolBalance = balance.sol_balance + solDelta;

      const { error } = await supabase
        .from('wallet_balances')
        .update({
          usdt_balance: newUsdtBalance,
          sol_balance: newSolBalance,
        })
        .eq('wallet_address', walletAddress);

      if (error) throw error;

      setBalance({
        usdt_balance: newUsdtBalance,
        sol_balance: newSolBalance,
      });

      return true;
    } catch (error) {
      console.error('Error updating balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update balance',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [publicKey, connected]);

  return { balance, loading, updateBalance, refreshBalance: fetchBalance };
};
