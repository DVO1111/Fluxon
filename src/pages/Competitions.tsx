import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Competition {
  id: string;
  name: string;
  description: string;
  entry_fee: number;
  virtual_balance: number;
  start_time: string;
  end_time: string;
  status: 'upcoming' | 'active' | 'completed';
  max_participants: number;
  participant_count?: number;
}

const Competitions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetitions();
    
    const channel = supabase
      .channel('competitions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'competitions' }, () => {
        fetchCompetitions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select(`
          *,
          competition_participants(count)
        `)
        .order('start_time', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(comp => ({
        ...comp,
        participant_count: comp.competition_participants?.[0]?.count || 0
      })) || [];

      setCompetitions(formattedData);
    } catch (error) {
      console.error('Error fetching competitions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load competitions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Trading Competitions
              </h1>
              <p className="text-muted-foreground mt-1">
                Compete, trade, and win NFT rewards
              </p>
            </div>
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Trading
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading competitions...</p>
          </div>
        ) : competitions.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No competitions available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitions.map((competition) => (
              <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{competition.name}</CardTitle>
                    <Badge className={getStatusColor(competition.status)}>
                      {competition.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {competition.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Entry Fee</p>
                        <p className="font-semibold">${competition.entry_fee}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Virtual Balance</p>
                        <p className="font-semibold">${competition.virtual_balance}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Starts</p>
                        <p className="text-sm">{format(new Date(competition.start_time), 'MMM d, HH:mm')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ends</p>
                        <p className="text-sm">{format(new Date(competition.end_time), 'MMM d, HH:mm')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {competition.participant_count}
                        {competition.max_participants && `/${competition.max_participants}`} participants
                      </span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/competition/${competition.id}`)}
                    disabled={competition.status === 'completed'}
                  >
                    {competition.status === 'active' ? 'Join Now' : 
                     competition.status === 'upcoming' ? 'View Details' : 
                     'View Results'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Competitions;
