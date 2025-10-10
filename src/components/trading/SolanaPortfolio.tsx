import { Card } from '@/components/ui/card';
import { TrendingUp, Wallet, DollarSign } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useEffect, useState } from 'react';

export const SolanaPortfolio = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (publicKey) {
      connection.getBalance(publicKey).then((bal) => {
        setBalance(bal / LAMPORTS_PER_SOL);
      });
    }
  }, [publicKey, connection]);

  if (!publicKey) {
    return (
      <Card className="p-6 bg-gradient-card border-primary/20">
        <div className="text-center py-8">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Connect wallet to view portfolio</p>
        </div>
      </Card>
    );
  }

  const totalValue = balance * 150; // Approximate SOL price

  return (
    <Card className="p-6 bg-gradient-card border-primary/20">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Portfolio Overview
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 rounded-lg bg-card/50 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-primary" />
              <div>
                <p className="font-semibold">SOL</p>
                <p className="text-sm text-muted-foreground">Solana</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{balance.toFixed(4)}</p>
              <p className="text-sm text-success">+5.2%</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
