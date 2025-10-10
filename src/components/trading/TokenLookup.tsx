import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export const TokenLookup = () => {
  const [contractAddress, setContractAddress] = useState('');

  const handleLookup = () => {
    if (!contractAddress.trim()) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid contract address',
        variant: 'destructive',
      });
      return;
    }

    const dexScreenerUrl = `https://dexscreener.com/solana/${contractAddress}`;
    window.open(dexScreenerUrl, '_blank');
    
    toast({
      title: 'Opening DEX Screener',
      description: 'Viewing token details in new tab',
    });
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
        <Button
          onClick={handleLookup}
          className="w-full bg-gradient-primary hover:opacity-90"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on DEX Screener
        </Button>
        <p className="text-xs text-muted-foreground">
          Enter any Solana token contract address to view its trading data on DEX Screener
        </p>
      </div>
    </Card>
  );
};
