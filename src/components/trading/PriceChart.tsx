import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCryptoPrices, CryptoPrice } from '@/hooks/useCryptoPrices';
import { Skeleton } from '@/components/ui/skeleton';

export const PriceChart = () => {
  const { data: prices, isLoading } = useCryptoPrices();

  if (isLoading) {
    return (
      <Card className="p-6 bg-gradient-card border-primary/20">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-primary/20">
      <h3 className="text-lg font-semibold mb-4">Live Crypto Prices</h3>
      <div className="space-y-3">
        {prices?.map((crypto: CryptoPrice) => (
          <div
            key={crypto.id}
            className="flex items-center justify-between p-4 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
              <div>
                <p className="font-semibold">{crypto.symbol.toUpperCase()}</p>
                <p className="text-sm text-muted-foreground">{crypto.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">${crypto.current_price.toLocaleString()}</p>
              <Badge
                variant={crypto.price_change_percentage_24h >= 0 ? 'default' : 'destructive'}
                className={
                  crypto.price_change_percentage_24h >= 0
                    ? 'bg-success/20 text-success-foreground border-success/50'
                    : ''
                }
              >
                {crypto.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
