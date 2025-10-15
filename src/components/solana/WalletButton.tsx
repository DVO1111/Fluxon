import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css'; // important!

const WalletButton = () => {
  return (
    <div className="wallet-adapter-button-wrapper">
      <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !rounded-xl !transition-all !duration-300" />
    </div>
  );
};

export default WalletButton;
