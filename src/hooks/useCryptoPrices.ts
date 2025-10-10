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
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
