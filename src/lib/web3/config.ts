import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, polygon, arbitrum, optimism } from 'wagmi/chains';
import { metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';

const projectId = 'c74e1c6e9e4f4e8db5c8e5f4e5f4e5f4'; // Public WalletConnect project ID

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, arbitrum, optimism],
  connectors: [
    metaMask(),
    walletConnect({ projectId }),
    coinbaseWallet({ appName: 'D-Trade' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
});
