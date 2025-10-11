import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserBalance {
  usdt_balance: number;
  sol_balance: number;
}

export const useUserBalance = () => {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setBalance(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_balances')
        .select('usdt_balance, sol_balance')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setBalance(data);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch balance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = async (usdtDelta: number, solDelta: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !balance) return;

      const newUsdtBalance = balance.usdt_balance + usdtDelta;
      const newSolBalance = balance.sol_balance + solDelta;

      const { error } = await supabase
        .from('user_balances')
        .update({
          usdt_balance: newUsdtBalance,
          sol_balance: newSolBalance,
        })
        .eq('user_id', user.id);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchBalance();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { balance, loading, updateBalance, refreshBalance: fetchBalance };
};
