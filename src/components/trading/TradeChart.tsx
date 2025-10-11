import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TradeChartProps {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  onClose: () => void;
}

export const TradeChart = ({ fromToken, toToken, fromAmount, toAmount, onClose }: TradeChartProps) => {
  // Generate mock price history data
  const generateMockData = () => {
    const data = [];
    let price = 150;
    for (let i = 0; i < 20; i++) {
      price = price + (Math.random() - 0.5) * 10;
      data.push({
        time: `${i}m`,
        price: parseFloat(price.toFixed(2)),
      });
    }
    return data;
  };

  const data = generateMockData();
  const priceChange = ((data[data.length - 1].price - data[0].price) / data[0].price) * 100;
  const isPositive = priceChange >= 0;

  return (
    <Card className="p-6 bg-gradient-card border-primary/20 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Trade Executed Successfully</h3>
          <p className="text-sm text-muted-foreground">
            {fromAmount} {fromToken} → {toAmount} {toToken}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold">${data[data.length - 1].price}</span>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Last 20 minutes</p>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
