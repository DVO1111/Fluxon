import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowDownUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { TradeChart } from './TradeChart';
import { Connection, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import { supabase } from '@/integrations/supabase/client';
import { endpoint } from '@/lib/solana/config';

const SOLANA_TOKENS = [
  { symbol: 'SOL', name: 'Solana', decimals: 9 },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', name: 'Tether', decimals: 6 },
  { symbol: 'RAY', name: 'Raydium', decimals: 6 },
  { symbol: 'SRM', name: 'Serum', decimals: 6 },
  { symbol: 'BONK', name: 'Bonk', decimals: 5 },
  { symbol: 'JUP', name: 'Jupiter', decimals: 6 },
  { symbol: 'ORCA', name: 'Orca', decimals: 6 },
  { symbol: 'MNGO', name: 'Mango', decimals: 6 },
  { symbol: 'STEP', name: 'Step Finance', decimals: 9 },
  { symbol: 'COPE', name: 'Cope', decimals: 6 },
  { symbol: 'MEDIA', name: 'Media Network', decimals: 6 },
  { symbol: 'ROPE', name: 'Rope Token', decimals: 9 },
  { symbol: 'MER', name: 'Mercurial', decimals: 6 },
  { symbol: 'PORT', name: 'Port Finance', decimals: 6 },
];

interface SolanaSwapProps {
  preselectedToken?: {
    address: string;
    symbol: string;
    name: string;
  };
}

export const SolanaSwap = ({ preselectedToken }: SolanaSwapProps) => {
  const { publicKey, signTransaction } = useWallet();
  const { balance, updateBalance } = useWalletBalance();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(preselectedToken?.symbol || 'USDT');
  const [toToken, setToToken] = useState('SOL');
  const [showChart, setShowChart] = useState(false);
  const [lastTrade, setLastTrade] = useState<any>(null);
  const [isSwapping, setIsSwapping] = useState(false);

  // Auto-calculate toAmount when fromAmount changes
  useEffect(() => {
    if (fromAmount && parseFloat(fromAmount) > 0) {
      const rate = fromToken === 'USDT' ? 1 / 150 : 150;
      const calculated = (parseFloat(fromAmount) * rate).toFixed(6);
      setToAmount(calculated);
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = async () => {
    if (!publicKey || !signTransaction) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to start trading',
        variant: 'destructive',
      });
      return;
    }

    if (!balance) {
      toast({
        title: 'Loading',
        description: 'Please wait while we load your balance',
        variant: 'destructive',
      });
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount to swap',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(fromAmount);
    const calculatedToAmount = (amount * 150).toFixed(6);

    // Check balance
    if (fromToken === 'USDT' && amount > balance.usdt_balance) {
      toast({
        title: 'Insufficient Balance',
        description: 'You do not have enough USDT',
        variant: 'destructive',
      });
      return;
    }

    setIsSwapping(true);

    try {
      // Create and sign transaction
      const connection = new Connection(endpoint);
      const transaction = new Transaction();
      
      // Add a dummy instruction (in production, this would be actual swap instruction)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey,
          lamports: 1,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Send transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      toast({
        title: 'Transaction Signed',
        description: 'Processing your swap...',
      });

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      // Update balances based on swap
      let usdtDelta = 0;
      let solDelta = 0;

      if (fromToken === 'USDT' && toToken === 'SOL') {
        usdtDelta = -amount;
        solDelta = parseFloat(calculatedToAmount);
      } else if (fromToken === 'SOL' && toToken === 'USDT') {
        usdtDelta = parseFloat(calculatedToAmount);
        solDelta = -amount;
      }

      const success = await updateBalance(usdtDelta, solDelta);

      if (success) {
        // Save trade to database
        await supabase.from('trades').insert({
          wallet_address: publicKey.toString(),
          from_token: fromToken,
          to_token: toToken,
          from_amount: amount,
          to_amount: parseFloat(calculatedToAmount),
          transaction_signature: signature,
        });

        setLastTrade({
          fromToken,
          toToken,
          fromAmount,
          toAmount: calculatedToAmount,
        });
        setShowChart(true);
        
        toast({
          title: 'Swap Successful',
          description: `Swapped ${fromAmount} ${fromToken} for ${calculatedToAmount} ${toToken}`,
        });

        // Reset form
        setFromAmount('');
        setToAmount('');
      }
    } catch (error: any) {
      toast({
        title: 'Swap Failed',
        description: error.message || 'Failed to complete swap',
        variant: 'destructive',
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <>
      {showChart && lastTrade && (
        <TradeChart
          fromToken={lastTrade.fromToken}
          toToken={lastTrade.toToken}
          fromAmount={lastTrade.fromAmount}
          toAmount={lastTrade.toAmount}
          onClose={() => setShowChart(false)}
        />
      )}
      
      <Card className="p-6 bg-gradient-card border-primary/20">
        <h3 className="text-lg font-semibold mb-4">Token Swap</h3>
        {preselectedToken && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground">Trading custom token:</p>
            <p className="text-sm font-semibold text-primary">{preselectedToken.name} ({preselectedToken.symbol})</p>
          </div>
        )}
        <div className="space-y-4">
        <div className="space-y-2">
          <Label>From</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 bg-background border-border"
            />
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value)}
              className="px-4 py-2 rounded-md bg-background border border-border text-foreground"
            >
              {SOLANA_TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFlip}
            className="rounded-full border-primary/50 hover:bg-primary/10"
          >
            <ArrowDownUp className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label>To</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              className="flex-1 bg-background border-border"
            />
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="px-4 py-2 rounded-md bg-background border border-border text-foreground"
            >
              {SOLANA_TOKENS.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleSwap}
          className="w-full bg-gradient-primary hover:opacity-90"
          disabled={!publicKey || !balance || isSwapping}
        >
          {isSwapping ? 'Signing Transaction...' : publicKey && balance ? 'Swap Tokens' : 'Connect Wallet to Swap'}
        </Button>

        {fromAmount && (
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Exchange Rate:</span>
              <span>1 {fromToken} ≈ 150 {toToken}</span>
            </div>
            <div className="flex justify-between">
              <span>Network Fee:</span>
              <span>~0.000005 SOL</span>
            </div>
          </div>
        )}
      </div>
    </Card>
    </>
  );
};
