import { Card } from '@/components/ui/card';
import { useWalletBalance } from '@/hooks/useWalletBalance';
import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletBalance = () => {
  const { balance, loading } = useWalletBalance();
  const { connected } = useWallet();

  if (!connected) {
    return (
      <Card className="p-6 bg-gradient-card border-primary/20">
        <div className="text-center space-y-4">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Solana wallet to receive 100,000 USDT and start trading
            </p>
            <WalletMultiButton className="!bg-gradient-primary hover:!opacity-90" />
          </div>
        </div>
      </Card>
    );
  }

  if (loading || !balance) {
    return (
      <Card className="p-6 bg-gradient-card border-primary/20">
        <div className="text-center">
          <p className="text-muted-foreground">Loading balance...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Demo Balance
          </h3>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">USDT Balance</p>
            <p className="text-2xl font-bold text-primary">
              ${balance.usdt_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
            <p className="text-xs text-muted-foreground mb-1">SOL Balance</p>
            <p className="text-2xl font-bold text-secondary">
              {balance.sol_balance.toFixed(4)} SOL
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          This is a demo account for practice trading
        </p>
      </div>
    </Card>
  );
};
