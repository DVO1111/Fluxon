import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';

interface CompetitionTradingProps {
  competitionId: string;
}

const TOKENS = ['SOL', 'BTC', 'ETH', 'USDT'];

const CompetitionTrading = ({ competitionId }: CompetitionTradingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fromToken, setFromToken] = useState('USDT');
  const [toToken, setToToken] = useState('SOL');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>({
    SOL: 150,
    BTC: 65000,
    ETH: 3500,
    USDT: 1
  });

  useEffect(() => {
    if (user) {
      fetchBalance();
      // Simulate price updates
      const interval = setInterval(() => {
        setPrices(prev => ({
          SOL: prev.SOL * (1 + (Math.random() - 0.5) * 0.02),
          BTC: prev.BTC * (1 + (Math.random() - 0.5) * 0.02),
          ETH: prev.ETH * (1 + (Math.random() - 0.5) * 0.02),
          USDT: 1
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [user, competitionId]);

  const fetchBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('competition_participants')
        .select('virtual_balance, current_portfolio_value')
        .eq('competition_id', competitionId)
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setBalance(data.virtual_balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const executeTrade = async () => {
    if (!user || !amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    try {
      const fromAmount = parseFloat(amount);
      const fromPrice = prices[fromToken];
      const toPrice = prices[toToken];
      const toAmount = (fromAmount * fromPrice) / toPrice;

      // Insert trade record
      const { error: tradeError } = await supabase
        .from('competition_trades')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          from_token: fromToken,
          to_token: toToken,
          from_amount: fromAmount,
          to_amount: toAmount,
          price: toPrice
        });

      if (tradeError) throw tradeError;

      // Update participant balance
      const newBalance = balance - (fromToken === 'USDT' ? fromAmount : 0);
      const { error: updateError } = await supabase
        .from('competition_participants')
        .update({ virtual_balance: newBalance })
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Trade Executed',
        description: `Swapped ${fromAmount} ${fromToken} for ${toAmount.toFixed(4)} ${toToken}`
      });

      setAmount('');
      fetchBalance();
    } catch (error) {
      console.error('Error executing trade:', error);
      toast({
        title: 'Error',
        description: 'Failed to execute trade',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const estimatedOutput = amount && parseFloat(amount) > 0
    ? (parseFloat(amount) * prices[fromToken]) / prices[toToken]
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Execute Trade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map(token => (
                    <SelectItem key={token} value={token}>{token}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Balance: {balance.toFixed(2)} USDT
              </p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.filter(t => t !== fromToken).map(token => (
                    <SelectItem key={token} value={token}>{token}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="0.00"
                value={estimatedOutput.toFixed(4)}
                disabled
              />
              <p className="text-sm text-muted-foreground">
                Estimated output
              </p>
            </div>
          </div>

          <Button 
            onClick={executeTrade} 
            className="w-full" 
            disabled={loading || !amount || parseFloat(amount) <= 0}
          >
            {loading ? 'Executing...' : 'Execute Trade'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Prices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(prices).map(([token, price]) => (
            <div key={token} className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{token}</span>
                {Math.random() > 0.5 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
              <span className="font-mono">${price.toFixed(2)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitionTrading;
