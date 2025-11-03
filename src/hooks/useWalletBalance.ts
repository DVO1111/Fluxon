import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logError } from '@/lib/utils';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

export interface WalletBalance {
  usdt_balance: number;
  sol_balance: number;
}

export const useWalletBalance = () => {
  const { publicKey, connected, signMessage } = useWallet();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  const verifyWallet = async () => {
    if (!publicKey || !signMessage) {
      return false;
    }

    try {
      // Create authentication message
      const nonce = crypto.randomUUID();
      const timestamp = Date.now();
      const message = `Authenticate to Fluxon\nWallet: ${publicKey.toString()}\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
      
      // Sign message
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      
      // Verify with edge function
      const { data, error } = await supabase.functions.invoke('verify-wallet', {
        body: { 
          publicKey: publicKey.toString(), 
          signature: btoa(String.fromCharCode(...signature)),
          message 
        }
      });

      if (error || !data?.verified) {
        console.error('Wallet verification failed:', error);
        return false;
      }

      setVerified(true);
      return true;
    } catch (error) {
      console.error('Error verifying wallet:', error);
      toast({
        title: 'Verification Failed',
        description: 'Please sign the message to verify wallet ownership',
        variant: 'destructive',
      });
      return false;
    }
  };

  const fetchBalance = async () => {
    // Reset loading for each fetch attempt
    setLoading(true);
    if (!publicKey || !connected) {
      setBalance(null);
      setVerified(false);
      setLoading(false);
      return;
    }

    // Verify wallet ownership before fetching balance
    if (!verified) {
      const isVerified = await verifyWallet();
      if (!isVerified) {
        setLoading(false);
        return;
      }
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
