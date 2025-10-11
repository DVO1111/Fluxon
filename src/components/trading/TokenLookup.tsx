import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, ExternalLink, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface TokenLookupProps {
  onTokenSelect?: (token: { address: string; symbol: string; name: string }) => void;
}

export const TokenLookup = ({ onTokenSelect }: TokenLookupProps) => {
  const [contractAddress, setContractAddress] = useState('');
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  const handleLookup = () => {
    if (!contractAddress.trim()) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid contract address',
        variant: 'destructive',
      });
      return;
    }

    // Mock token info - in production, fetch from DEX Screener API
    const mockTokenInfo = {
      address: contractAddress,
      symbol: 'TOKEN',
      name: 'Custom Token',
    };
    
    setTokenInfo(mockTokenInfo);
    
    toast({
      title: 'Token Found',
      description: 'You can now trade this token below',
    });
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
          >
            <Search className="w-4 h-4 mr-2" />
            Find Token
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
          <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Token Name</p>
              <p className="font-semibold">{tokenInfo.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Symbol</p>
              <p className="font-semibold">{tokenInfo.symbol}</p>
            </div>
            <Button
              onClick={handleTrade}
              className="w-full bg-gradient-primary hover:opacity-90"
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
