import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CompetitionTrading from '@/components/competition/CompetitionTrading';
import CompetitionLeaderboard from '@/components/competition/CompetitionLeaderboard';
import CompetitionChat from '@/components/competition/CompetitionChat';
import CompetitionBetting from '@/components/competition/CompetitionBetting';

interface Competition {
  id: string;
  name: string;
  description: string;
  entry_fee: number;
  virtual_balance: number;
  start_time: string;
  end_time: string;
  status: string;
}

const CompetitionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCompetition();
      checkParticipation();
    }
  }, [id, user]);

  const fetchCompetition = async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCompetition(data);
    } catch (error) {
      console.error('Error fetching competition:', error);
      toast({
        title: 'Error',
        description: 'Failed to load competition',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkParticipation = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('competition_participants')
        .select('*')
        .eq('competition_id', id)
        .eq('user_id', user.id)
        .single();

      setHasJoined(!!data);
    } catch (error) {
      console.error('Error checking participation:', error);
    }
  };

  const joinCompetition = async () => {
    if (!user || !competition) return;

    try {
      // Check wallet balance
      const { data: balance, error: balanceError } = await supabase
        .from('wallet_balances')
        .select('usdt_balance')
        .eq('user_id', user.id)
        .single();

      if (balanceError) throw balanceError;

      if (balance.usdt_balance < competition.entry_fee) {
        toast({
          title: 'Insufficient Balance',
          description: 'You do not have enough USDT to join this competition',
          variant: 'destructive'
        });
        return;
      }

      // Deduct entry fee
      const { error: updateError } = await supabase
        .from('wallet_balances')
        .update({ usdt_balance: balance.usdt_balance - competition.entry_fee })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Join competition
      const { error: joinError } = await supabase
        .from('competition_participants')
        .insert({
          competition_id: competition.id,
          user_id: user.id,
          virtual_balance: competition.virtual_balance,
          current_portfolio_value: competition.virtual_balance
        });

      if (joinError) throw joinError;

      setHasJoined(true);
      toast({
        title: 'Success',
        description: 'You have joined the competition!'
      });
    } catch (error) {
      console.error('Error joining competition:', error);
      toast({
        title: 'Error',
        description: 'Failed to join competition',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Competition not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/competitions')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{competition.name}</h1>
                <p className="text-sm text-muted-foreground">{competition.description}</p>
              </div>
            </div>
            {!hasJoined && competition.status !== 'completed' && (
              <Button onClick={joinCompetition}>
                Join for ${competition.entry_fee}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!hasJoined ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Join this competition to start trading and compete for rewards!
            </p>
            <Button onClick={joinCompetition} size="lg">
              Join Competition - ${competition.entry_fee}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="trading" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trading">Trading</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="betting">Betting</TabsTrigger>
            </TabsList>

            <TabsContent value="trading" className="mt-6">
              <CompetitionTrading competitionId={competition.id} />
            </TabsContent>

            <TabsContent value="leaderboard" className="mt-6">
              <CompetitionLeaderboard competitionId={competition.id} />
            </TabsContent>

            <TabsContent value="chat" className="mt-6">
              <CompetitionChat competitionId={competition.id} />
            </TabsContent>

            <TabsContent value="betting" className="mt-6">
              <CompetitionBetting competitionId={competition.id} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default CompetitionDetail;
