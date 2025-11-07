import { useQuery } from '@tanstack/react-query';

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

const TOKEN_IDS = [
  'solana',
  'usd-coin', 
  'tether',
  'raydium',
  'serum',
  'bonk',
  'jupiter-exchange-solana',
  'orca',
  'mango-markets',
  'step-finance',
  'cope',
  'media-network',
  'rope-token',
  'mercurial',
  'port-finance'
].join(',');

export const useCryptoPrices = () => {
  return useQuery<CryptoPrice[]>({
    queryKey: ['crypto-prices'],
    queryFn: async () => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }
      return response.json();
    },
    refetchInterval: 30000,
  });
};

export const useTokenPrices = () => {
  return useQuery<Record<string, number>>({
    queryKey: ['token-prices'],
    queryFn: async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${TOKEN_IDS}&sparkline=false`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch token prices');
      }
      const data: CryptoPrice[] = await response.json();
      
      const priceMap: Record<string, number> = {};
      data.forEach(token => {
        priceMap[token.symbol.toUpperCase()] = token.current_price;
      });
      
      return priceMap;
    },
    refetchInterval: 10000,
  });
};
