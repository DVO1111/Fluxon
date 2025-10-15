import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export const WalletBalance = () => {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState({ usdt: 0, sol: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalance({ usdt: 0, sol: 0 });
      return;
    }

    // Demo balance (mock data)
    setLoading(true);
    setTimeout(() => {
      setBalance({
        usdt: 100000.0,
        sol: 10.0,
      });
      setLoading(false);
    }, 800);
  }, [publicKey, connected]);

  if (!connected) return <p>Connect your wallet to view balances.</p>;

  if (loading) return <p>Loading balances...</p>;

  return (
    <div className="bg-black/30 p-4 rounded-lg text-white">
      <h3 className="font-semibold mb-2">Demo Balances</h3>
      <p>💵 USDT: {balance.usdt.toLocaleString()} USDT</p>
      <p>⚡ SOL: {balance.sol} SOL</p>
    </div>
  );
};
