import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, LogOut } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export const WalletConnect = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = (connector: any) => {
    connect(
      { connector },
      {
        onSuccess: () => {
          toast({
            title: 'Wallet Connected',
            description: 'Successfully connected to your wallet',
          });
        },
        onError: (error) => {
          toast({
            title: 'Connection Failed',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (isConnected && address) {
    return (
      <Card className="p-4 bg-gradient-card border-primary/20">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connected Wallet</p>
              <p className="font-mono text-sm">
                {address.slice(0, 6)}...{address.slice(-4)}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => disconnect()}
            className="border-destructive/50 hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-primary/20">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-primary" />
        Connect Your Wallet
      </h3>
      <div className="space-y-3">
        {connectors.map((connector) => (
          <Button
            key={connector.id}
            onClick={() => handleConnect(connector)}
            variant="outline"
            className="w-full justify-start border-border hover:border-primary/50 hover:bg-primary/5"
          >
            <Wallet className="w-4 h-4 mr-2" />
            {connector.name}
          </Button>
        ))}
      </div>
    </Card>
  );
};
