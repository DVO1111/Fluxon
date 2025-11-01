import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface CompetitionLeaderboardProps {
  competitionId: string;
}

interface Participant {
  id: string;
  user_id: string;
  virtual_balance: number;
  current_portfolio_value: number;
  rank: number;
}

const CompetitionLeaderboard = ({ competitionId }: CompetitionLeaderboardProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    fetchLeaderboard();

    const channel = supabase
      .channel(`leaderboard-${competitionId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'competition_participants', filter: `competition_id=eq.${competitionId}` },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [competitionId]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('competition_participants')
        .select('*')
        .eq('competition_id', competitionId)
        .order('current_portfolio_value', { ascending: false });

      if (error) throw error;

      // Calculate ranks
      const rankedData = data?.map((p, idx) => ({
        ...p,
        rank: idx + 1
      })) || [];

      setParticipants(rankedData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-muted-foreground">{rank}</span>;
  };

  const getProfitLoss = (participant: Participant) => {
    const change = participant.current_portfolio_value - participant.virtual_balance;
    const percentChange = (change / participant.virtual_balance) * 100;
    return { change, percentChange };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Live Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {participants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No participants yet
            </p>
          ) : (
            participants.map((participant) => {
              const { change, percentChange } = getProfitLoss(participant);
              return (
                <div
                  key={participant.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    participant.rank <= 3 ? 'bg-muted' : 'bg-card'
                  } border`}
                >
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(participant.rank)}
                  </div>

                  <Avatar>
                    <AvatarFallback>
                      {participant.user_id.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className="font-semibold">
                      Trader #{participant.user_id.substring(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Portfolio: ${participant.current_portfolio_value.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={`font-semibold ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {change >= 0 ? '+' : ''}${change.toFixed(2)}
                    </p>
                    <p className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {change >= 0 ? '+' : ''}{percentChange.toFixed(2)}%
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitionLeaderboard;
