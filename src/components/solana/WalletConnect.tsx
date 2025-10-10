import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Card } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

export const WalletConnect = () => {
  const { publicKey } = useWallet();

  return (
    <Card className="p-6 bg-gradient-card border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Solana Wallet</h3>
            {publicKey && (
              <p className="text-sm text-muted-foreground font-mono">
                {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </p>
            )}
          </div>
        </div>
        <WalletMultiButton className="!bg-gradient-primary hover:!opacity-90 !rounded-lg !h-10" />
      </div>
    </Card>
  );
};
