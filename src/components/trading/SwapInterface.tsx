import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowDownUp } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useAccount } from 'wagmi';

export const SwapInterface = () => {
  const { isConnected } = useAccount();
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');

  const handleSwap = () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to swap tokens',
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

    toast({
      title: 'Swap Initiated',
      description: `Swapping ${fromAmount} ${fromToken} for ${toAmount || '...'} ${toToken}`,
    });
  };

  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  return (
    <Card className="p-6 bg-gradient-card border-primary/20">
      <h3 className="text-lg font-semibold mb-4">Token Swap</h3>
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
              <option value="ETH">ETH</option>
              <option value="USDC">USDC</option>
              <option value="DAI">DAI</option>
              <option value="WBTC">WBTC</option>
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
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
              <option value="DAI">DAI</option>
              <option value="WBTC">WBTC</option>
            </select>
          </div>
        </div>

        <Button
          onClick={handleSwap}
          className="w-full bg-gradient-primary hover:opacity-90"
          disabled={!isConnected}
        >
          {isConnected ? 'Swap Tokens' : 'Connect Wallet to Swap'}
        </Button>

        {fromAmount && (
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Exchange Rate:</span>
              <span>1 {fromToken} ≈ 2,500 {toToken}</span>
            </div>
            <div className="flex justify-between">
              <span>Network Fee:</span>
              <span>~$5.00</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
