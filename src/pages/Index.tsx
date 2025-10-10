import { WalletConnect } from '@/components/web3/WalletConnect';
import { PriceChart } from '@/components/trading/PriceChart';
import { SwapInterface } from '@/components/trading/SwapInterface';
import { PortfolioCard } from '@/components/trading/PortfolioCard';
import { Activity } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center animate-pulse-glow">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  D-Trade
                </h1>
                <p className="text-sm text-muted-foreground">Decentralized Trading Platform</p>
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
            <WalletConnect />
            <SwapInterface />
            <PortfolioCard />
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
          <p>Powered by Web3 Technology</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
