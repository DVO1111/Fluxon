import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, TrendingUp } from 'lucide-react';

interface CompetitionBettingProps {
  competitionId: string;
}

interface Participant {
  id: string;
  user_id: string;
  current_portfolio_value: number;
}

interface Bet {
  id: string;
  bettor_id: string;
  target_user_id: string;
  amount: number;
  potential_payout: number;
  status: string;
}

const CompetitionBetting = ({ competitionId }: CompetitionBettingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myBets, setMyBets] = useState<Bet[]>([]);
  const [selectedTrader, setSelectedTrader] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchParticipants();
      fetchMyBets();
    }

    const channel = supabase
      .channel(`betting-${competitionId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'competition_bets', filter: `competition_id=eq.${competitionId}` },
        () => fetchMyBets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [competitionId, user]);

  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('competition_participants')
        .select('*')
        .eq('competition_id', competitionId)
        .neq('user_id', user?.id)
        .order('current_portfolio_value', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const fetchMyBets = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('competition_bets')
        .select('*')
        .eq('competition_id', competitionId)
        .eq('bettor_id', user.id);

      if (error) throw error;
      setMyBets(data || []);
    } catch (error) {
      console.error('Error fetching bets:', error);
    }
  };

  const placeBet = async () => {
    if (!user || !selectedTrader || !betAmount || parseFloat(betAmount) <= 0) return;

    setLoading(true);
    try {
      const amount = parseFloat(betAmount);
      const potentialPayout = amount * 2; // 2x payout for demo

      // Check wallet balance
      const { data: balance, error: balanceError } = await supabase
        .from('wallet_balances')
        .select('usdt_balance')
        .eq('user_id', user.id)
        .single();

      if (balanceError) throw balanceError;

      if (balance.usdt_balance < amount) {
        toast({
          title: 'Insufficient Balance',
          description: 'You do not have enough USDT to place this bet',
          variant: 'destructive'
        });
        return;
      }

      // Deduct bet amount
      const { error: updateError } = await supabase
        .from('wallet_balances')
        .update({ usdt_balance: balance.usdt_balance - amount })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Place bet
      const { error: betError } = await supabase
        .from('competition_bets')
        .insert({
          competition_id: competitionId,
          bettor_id: user.id,
          target_user_id: selectedTrader,
          amount,
          potential_payout: potentialPayout,
          status: 'active'
        });

      if (betError) throw betError;

      toast({
        title: 'Bet Placed',
        description: `You bet $${amount} on trader performance`
      });

      setBetAmount('');
      setSelectedTrader('');
      fetchMyBets();
    } catch (error) {
      console.error('Error placing bet:', error);
      toast({
        title: 'Error',
        description: 'Failed to place bet',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Place a Bet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Trader</Label>
            <Select value={selectedTrader} onValueChange={setSelectedTrader}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a trader to bet on" />
              </SelectTrigger>
              <SelectContent>
                {participants.map((p) => (
                  <SelectItem key={p.id} value={p.user_id}>
                    Trader #{p.user_id.substring(0, 8)} - ${p.current_portfolio_value.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bet Amount (USDT)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
            />
          </div>

          {betAmount && parseFloat(betAmount) > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Potential Payout:</span>
                <span className="font-semibold text-green-500">
                  ${(parseFloat(betAmount) * 2).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={placeBet}
            className="w-full"
            disabled={loading || !selectedTrader || !betAmount || parseFloat(betAmount) <= 0}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            {loading ? 'Placing Bet...' : 'Place Bet'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Active Bets</CardTitle>
        </CardHeader>
        <CardContent>
          {myBets.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No active bets yet
            </p>
          ) : (
            <div className="space-y-3">
              {myBets.map((bet) => (
                <div key={bet.id} className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Trader #{bet.target_user_id.substring(0, 8)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      bet.status === 'active' ? 'bg-blue-500/20 text-blue-500' :
                      bet.status === 'won' ? 'bg-green-500/20 text-green-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {bet.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold">${bet.amount.toFixed(2)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Potential Win</p>
                      <p className="font-semibold text-green-500">
                        ${bet.potential_payout.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitionBetting;
