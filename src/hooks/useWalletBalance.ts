import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logError } from '@/lib/utils';

export interface WalletBalance {
  usdt_balance: number;
  sol_balance: number;
}

export const useWalletBalance = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setBalance(null);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from('wallet_balances')
        .select('usdt_balance, sol_balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setBalance(data);
    } catch (error) {
      logError('fetchBalance', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (usdtDelta: number, solDelta: number): Promise<boolean> => {
    if (!userId || !balance) return false;

    try {
      const newUsdtBalance = balance.usdt_balance + usdtDelta;
      const newSolBalance = balance.sol_balance + solDelta;

      const result = await supabase
        .from('wallet_balances')
        .update({
          usdt_balance: newUsdtBalance,
          sol_balance: newSolBalance,
        })
        .eq('user_id', userId);

      if (result.error) throw result.error;

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
  }, []);

  return { balance, loading, updateBalance, refreshBalance: fetchBalance };
};
