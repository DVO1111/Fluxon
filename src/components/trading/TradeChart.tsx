import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TradeChartProps {
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  onClose: () => void;
}

export const TradeChart = ({ fromToken, toToken, fromAmount, toAmount, onClose }: TradeChartProps) => {
  const [priceData, setPriceData] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);

  useEffect(() => {
    const generateInitialData = () => {
      const data = [];
      const basePrice = parseFloat(toAmount) / parseFloat(fromAmount);
      const now = Date.now();
      
      for (let i = 19; i >= 0; i--) {
        const variance = (Math.random() - 0.5) * 0.02;
        data.push({
          time: new Date(now - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: basePrice * (1 + variance),
        });
      }
      return data;
    };

    const initialData = generateInitialData();
    setPriceData(initialData);
    setCurrentPrice(initialData[initialData.length - 1].price);
    setPriceChange(((initialData[initialData.length - 1].price - initialData[0].price) / initialData[0].price) * 100);

    // Update prices every 5 seconds
    const interval = setInterval(() => {
      setPriceData((prev) => {
        const lastPrice = prev[prev.length - 1].price;
        const variance = (Math.random() - 0.5) * 0.01;
        const newPrice = lastPrice * (1 + variance);
        
        const newData = [
          ...prev.slice(1),
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: newPrice,
          },
        ];

        setCurrentPrice(newPrice);
        setPriceChange(((newPrice - prev[0].price) / prev[0].price) * 100);
        
        return newData;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [fromAmount, toAmount]);

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
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold">${currentPrice.toFixed(6)}</span>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Live Price Updates</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={priceData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="time"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => value.toFixed(4)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
