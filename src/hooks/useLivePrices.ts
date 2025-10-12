import { useQuery } from '@tanstack/react-query';

export interface TokenPrice {
  address: string;
  symbol: string;
  name: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
}

export const useLivePrices = (tokenAddress?: string) => {
  return useQuery<TokenPrice>({
    queryKey: ['live-price', tokenAddress],
    queryFn: async () => {
      if (!tokenAddress) throw new Error('Token address required');
      
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch token price');
      }
      
      const data = await response.json();
      const pair = data.pairs?.[0];
      
      if (!pair) {
        throw new Error('Token not found');
      }
      
      return {
        address: tokenAddress,
        symbol: pair.baseToken.symbol,
        name: pair.baseToken.name,
        price: parseFloat(pair.priceUsd || '0'),
        priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
        volume24h: parseFloat(pair.volume?.h24 || '0'),
        liquidity: parseFloat(pair.liquidity?.usd || '0'),
      };
    },
    refetchInterval: 10000, // Refetch every 10 seconds for live updates
    enabled: !!tokenAddress,
  });
};
