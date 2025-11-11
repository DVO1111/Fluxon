import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { CryptoPrice } from '@/hooks/useCryptoPrices';

interface TokenSelectProps {
  tokens: Array<{ symbol: string; name: string }>;
  value: string;
  onChange: (value: string) => void;
  prices?: CryptoPrice[];
  loading?: boolean;
}

export const TokenSelect = ({ tokens, value, onChange, prices, loading }: TokenSelectProps) => {
  const [open, setOpen] = useState(false);

  const getPriceData = (symbol: string) => {
    if (!prices) return null;
    return prices.find(p => p.symbol.toUpperCase() === symbol.toUpperCase());
  };

  const selectedToken = tokens.find(t => t.symbol === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[180px] justify-between bg-background border-border hover:bg-accent"
        >
          <span className="font-semibold">{value}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0 bg-background border-border z-50">
        <Command>
          <CommandInput placeholder="Search token..." className="border-none" />
          <CommandList>
            <CommandEmpty>No token found.</CommandEmpty>
            <CommandGroup>
              {tokens.map((token) => {
                const priceData = getPriceData(token.symbol);
                const hasData = priceData && !loading;
                
                return (
                  <CommandItem
                    key={token.symbol}
                    value={token.symbol}
                    onSelect={() => {
                      onChange(token.symbol);
                      setOpen(false);
                    }}
                    className="cursor-pointer py-3"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{token.symbol}</span>
                        <span className="text-xs text-muted-foreground">{token.name}</span>
                      </div>
                      
                      {hasData && (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1">
                            {priceData.price_change_percentage_24h >= 0 ? (
                              <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : (
                              <TrendingDown className="w-3 h-3 text-red-500" />
                            )}
                            <span className={`text-xs font-semibold ${
                              priceData.price_change_percentage_24h >= 0 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                              {priceData.price_change_percentage_24h.toFixed(2)}%
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Vol: ${(priceData.total_volume / 1e9).toFixed(2)}B
                          </span>
                        </div>
                      )}
                      
                      {loading && (
                        <div className="text-xs text-muted-foreground">Loading...</div>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
