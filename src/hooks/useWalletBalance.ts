import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logError } from '@/lib/utils';

export interface WalletBalance {
  usdt_balance: number;
  sol_balance: number;
}

export const useWalletBalance = () => {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    // Reset loading for each fetch attempt
    setLoading(true);
    if (!publicKey || !connected) {
      setBalance(null);
      setLoading(false);
      return;
    }

    try {
      const walletAddress = publicKey.toString();

      // Try to get the most recent record (avoids errors if duplicates exist)
      const { data, error } = await supabase
        .from('wallet_balances')
        .select('usdt_balance, sol_balance')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false })
        .limit(1)
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
        
        setBalance({
          usdt_balance: Number((newBalance as any).usdt_balance),
          sol_balance: Number((newBalance as any).sol_balance),
        });
        toast({
          title: 'Welcome to Fluxon! ⚡️',
          description: 'You received 100,000 USDT demo balance',
        });
        return;
      }

      if (error) throw error;
      setBalance({
        usdt_balance: Number((data as any).usdt_balance),
        sol_balance: Number((data as any).sol_balance),
      });
    } catch (error) {
      logError('fetchBalance', error);
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
      logError('updateBalance', error);
      toast({
        title: 'Unable to Update Balance',
        description: 'Please try again later',
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
