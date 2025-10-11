import { useState } from 'react';
import { WalletConnect } from '@/components/solana/WalletConnect';
import { PriceChart } from '@/components/trading/PriceChart';
import { SolanaSwap } from '@/components/trading/SolanaSwap';
import { SolanaPortfolio } from '@/components/trading/SolanaPortfolio';
import { TokenLookup } from '@/components/trading/TokenLookup';
import { UserProfile } from '@/components/solana/UserProfile';
import { Activity } from 'lucide-react';
import fluxonLogo from '@/assets/fluxon-logo.png';

const Index = () => {
  const [selectedToken, setSelectedToken] = useState<{
    address: string;
    symbol: string;
    name: string;
  } | undefined>(undefined);

  const handleTokenSelect = (token: { address: string; symbol: string; name: string }) => {
    setSelectedToken(token);
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={fluxonLogo} alt="Fluxon" className="w-10 h-10 rounded-lg animate-pulse-glow" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Fluxon
                </h1>
                <p className="text-sm text-muted-foreground">Solana Trading Platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <UserProfile />
            <TokenLookup onTokenSelect={handleTokenSelect} />
            <SolanaSwap preselectedToken={selectedToken} />
            <SolanaPortfolio />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <WalletConnect />
            <PriceChart />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Powered by Solana Blockchain</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
