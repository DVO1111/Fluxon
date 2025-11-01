import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PriceChart } from '@/components/trading/PriceChart';
import { SolanaSwap } from '@/components/trading/SolanaSwap';
import { SolanaPortfolio } from '@/components/trading/SolanaPortfolio';
import { TokenLookup } from '@/components/trading/TokenLookup';
import { WalletBalance } from '@/components/solana/WalletBalance';
import { Button } from '@/components/ui/button';
import { History, Trophy } from 'lucide-react';
import WalletButton from "@/components/solana/WalletButton";
import fluxonLogo from '@/assets/fluxon-logo.png';

const Index = () => {
  const navigate = useNavigate();
  const [selectedToken, setSelectedToken] = useState<{
    address: string;
    symbol: string;
    name: string;
  } | undefined>(undefined);

  // ✅ DEMO BALANCE STATE
  const [demoBalance, setDemoBalance] = useState(1000); // starting demo balance

  // When token selected
  const handleTokenSelect = (token: { address: string; symbol: string; name: string }) => {
    setSelectedToken(token);
  };

  // ✅ Called when a swap happens
  const handleSwap = (amount: number) => {
    setDemoBalance((prev) => Math.max(prev - amount, 0)); // prevent negative balance
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Name */}
            <div className="flex items-center gap-3">
              <img src={fluxonLogo} alt="Fluxon" className="w-10 h-10 rounded-lg animate-pulse-glow" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Fluxon
                </h1>
                <p className="text-sm text-muted-foreground">Solana Trading Platform</p>
              </div>
            </div>

            {/* Actions (Wallet + Trade History + Competitions) */}
            <div className="flex items-center gap-3">
              <WalletButton />
              <Button
                onClick={() => navigate('/competitions')}
                variant="outline"
                className="gap-2"
              >
                <Trophy className="w-4 h-4" />
                Competitions
              </Button>
              <Button
                onClick={() => navigate('/history')}
                variant="outline"
                className="gap-2"
              >
                <History className="w-4 h-4" />
                Trade History
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <WalletBalance />
            <TokenLookup onTokenSelect={handleTokenSelect} />
            {/* ✅ Pass handler to update balance on swap */}
            <SolanaSwap preselectedToken={selectedToken} onSwap={handleSwap} />
            <SolanaPortfolio />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
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
