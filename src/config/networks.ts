// src/config/networks.ts
export interface NetworkConfig {
  name: string;
  wss: string;
  explorer: string;
  faucet?: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    name: 'Mainnet',
    wss: 'wss://xrplcluster.com',
    explorer: 'https://livenet.xrpl.org',
  },
  testnet: {
    name: 'Testnet',
    wss: 'wss://s.altnet.rippletest.net:51233',
    explorer: 'https://testnet.xrpl.org',
    faucet: 'https://faucet.altnet.rippletest.net/accounts',
  },
  devnet: {
    name: 'Devnet',
    wss: 'wss://s.devnet.rippletest.net:51233',
    explorer: 'https://devnet.xrpl.org',
    faucet: 'https://faucet.devnet.rippletest.net/accounts',
  },
};

export const getNetworkConfig = (network: string): NetworkConfig => {
  return NETWORKS[network] || NETWORKS.testnet;
};

export const getExplorerUrl = (network: string, hash: string): string => {
  const config = getNetworkConfig(network);
  return `${config.explorer}/transactions/${hash}`;
};