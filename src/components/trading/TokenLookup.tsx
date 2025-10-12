import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, ExternalLink, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TokenLookupProps {
  onTokenSelect?: (token: { address: string; symbol: string; name: string }) => void;
}

export const TokenLookup = ({ onTokenSelect }: TokenLookupProps) => {
  const [contractAddress, setContractAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<{
    address: string;
    name: string;
    symbol: string;
    price: number;
    priceChange24h: number;
  } | null>(null);

  const handleLookup = async () => {
    if (!contractAddress.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a contract address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Fetch real token data from DexScreener
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${contractAddress}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch token data');
      }

      const data = await response.json();
      const pair = data.pairs?.[0];

      if (!pair) {
        throw new Error('Token not found');
      }

      const tokenData = {
        address: contractAddress,
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        price: parseFloat(pair.priceUsd || '0'),
        priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
      };

      setTokenInfo(tokenData);

      toast({
        title: 'Token Found',
        description: `Found ${tokenData.name} (${tokenData.symbol})`,
      });
    } catch (error) {
      toast({
        title: 'Lookup Failed',
        description: 'Could not find token with this address on DexScreener',
        variant: 'destructive',
      });
      setTokenInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = () => {
    if (tokenInfo && onTokenSelect) {
      onTokenSelect(tokenInfo);
      toast({
        title: 'Token Selected',
        description: 'Scroll down to trade this token',
      });
    }
  };

  const handleViewOnDex = () => {
    if (!contractAddress.trim()) return;
    const dexScreenerUrl = `https://dexscreener.com/solana/${contractAddress}`;
    window.open(dexScreenerUrl, '_blank');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLookup();
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border-primary/20">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-primary" />
        DEX Screener Lookup
      </h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contract-address">Token Contract Address</Label>
          <Input
            id="contract-address"
            placeholder="Enter Solana token address..."
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-background border-border font-mono text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleLookup}
            className="bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Find Token
              </>
            )}
          </Button>
          <Button
            onClick={handleViewOnDex}
            variant="outline"
            className="border-primary/50"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            DEX Screener
          </Button>
        </div>

        {tokenInfo && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg space-y-2 border border-primary/20">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-semibold">{tokenInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Symbol:</span>
              <span className="font-semibold">{tokenInfo.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price:</span>
              <span className="font-semibold">${tokenInfo.price.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">24h Change:</span>
              <span className={`font-semibold ${tokenInfo.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {tokenInfo.priceChange24h >= 0 ? '+' : ''}{tokenInfo.priceChange24h.toFixed(2)}%
              </span>
            </div>
            <Button
              onClick={handleTrade}
              className="w-full bg-gradient-primary hover:opacity-90 mt-2"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Trade This Token
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Enter any Solana token contract address to trade custom tokens
        </p>
      </div>
    </Card>
  );
};
