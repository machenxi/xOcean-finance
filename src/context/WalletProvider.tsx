// src/context/WalletProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { WALLET_ADAPTERS } from '@/wallets';
import type { WalletAdapter } from '@/wallets/types';

type State = {
  adapter?: WalletAdapter;
  address?: string;
  network?: string;
  connected: boolean;
  connect: (id: WalletAdapter['id']) => Promise<void>;
  signAndSubmit: (tx: any) => Promise<{ hash: string }>;
  disconnect: () => void;
};

const Ctx = createContext<State>({
  connected: false,
  async connect() {},
  async signAndSubmit() { return { hash: '' }; },
  disconnect() {}
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adapter, setAdapter] = useState<WalletAdapter>();
  const [address, setAddress] = useState<string>();
  const [network, setNetwork] = useState<string>();

  useEffect(() => {
    const saved = localStorage.getItem('wallet.adapter');
    if (saved) {
      const ad = WALLET_ADAPTERS.find(a => a.id === saved);
      if (ad && ad.isAvailable()) {
        setAdapter(ad);
        // Try to reconnect automatically
        ad.connect().then(res => {
          setAddress(res.address);
          setNetwork(res.network);
        }).catch(() => {
          // Silent fail on auto-reconnect
          localStorage.removeItem('wallet.adapter');
        });
      }
    }
  }, []);

  const connect = async (id: WalletAdapter['id']) => {
    const ad = WALLET_ADAPTERS.find(a => a.id === id);
    if (!ad) throw new Error('Wallet not supported');
    if (!ad.isAvailable()) throw new Error(`${ad.name} not available`);
    const res = await ad.connect();
    setAdapter(ad);
    setAddress(res.address);
    setNetwork(res.network);
    localStorage.setItem('wallet.adapter', id);
  };

  const signAndSubmit = async (tx: any) => {
    if (!adapter) throw new Error('No wallet connected');
    return adapter.signAndSubmit(tx);
  };

  const disconnect = () => {
    setAdapter(undefined);
    setAddress(undefined);
    setNetwork(undefined);
    localStorage.removeItem('wallet.adapter');
  };

  const value = useMemo(() => ({
    adapter,
    address,
    network,
    connected: !!address,
    connect,
    signAndSubmit,
    disconnect
  }), [adapter, address, network]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useWallet = () => useContext(Ctx);