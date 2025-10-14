import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

interface Trade {
  id: string;
  from_token: string;
  to_token: string;
  from_amount: number;
  to_amount: number;
  transaction_signature: string | null;
  created_at: string;
}

export default function TradeHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else {
      fetchTrades();
    }
  }, [user, navigate]);

  const fetchTrades = async () => {
    if (!user) return;
    
    setLoading(true);
    const result = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!result.error && result.data) {
      setTrades(result.data as Trade[]);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-gradient-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Trade History
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-6 bg-gradient-card border-primary/20">
          {!user ? (
            <p className="text-center text-muted-foreground">
              Sign in to view trade history
            </p>
          ) : loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : trades.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No trades yet. Start trading to see your history!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>From Amount</TableHead>
                    <TableHead>To Amount</TableHead>
                    <TableHead>Signature</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="text-sm">
                        {formatDate(trade.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {trade.from_token}
                      </TableCell>
                      <TableCell className="font-medium">
                        {trade.to_token}
                      </TableCell>
                      <TableCell>{parseFloat(trade.from_amount.toString()).toFixed(6)}</TableCell>
                      <TableCell>{parseFloat(trade.to_amount.toString()).toFixed(6)}</TableCell>
                      <TableCell>
                        {trade.transaction_signature ? (
                          <a
                            href={`https://solscan.io/tx/${trade.transaction_signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <span className="font-mono text-xs">
                              {trade.transaction_signature.slice(0, 8)}...
                            </span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
