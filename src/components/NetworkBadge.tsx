// src/components/NetworkBadge.tsx
import { useWallet } from '@/context/WalletProvider';
import { getNetworkConfig } from '@/config/networks';

export default function NetworkBadge() {
  const { network } = useWallet();
  const networkConfig = getNetworkConfig(network || 'testnet');
  
  const getNetworkColor = (networkName: string) => {
    switch (networkName.toLowerCase()) {
      case 'mainnet':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'testnet':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'devnet':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getNetworkColor(networkConfig.name)}`}>
      {networkConfig.name}
    </span>
  );
}