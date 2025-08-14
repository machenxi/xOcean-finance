// src/hooks/useXRPL.ts
import { Client } from 'xrpl';
import { useEffect, useState, useCallback } from 'react';
import { XRPL_WSS } from '@/config/env';
import { getNetworkConfig } from '@/config/networks';
import { useWallet } from '@/context/WalletProvider';

export function useXRPL() {
  const { network } = useWallet();
  const [client, setClient] = useState<Client | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const connect = useCallback(async () => {
    if (client && connected) return client;
    
    setLoading(true);
    try {
      const networkConfig = getNetworkConfig(network || 'testnet');
      const newClient = new Client(networkConfig.wss);
      await newClient.connect();
      setClient(newClient);
      setConnected(true);
      return newClient;
    } catch (error) {
      console.error('Failed to connect to XRPL:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [network, client, connected]);

  const disconnect = useCallback(async () => {
    if (client && connected) {
      await client.disconnect();
      setClient(null);
      setConnected(false);
    }
  }, [client, connected]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (client && connected) {
        client.disconnect().catch(console.error);
      }
    };
  }, [client, connected]);

  // Reconnect when network changes
  useEffect(() => {
    if (connected) {
      disconnect().then(() => connect()).catch(console.error);
    }
  }, [network]);

  return {
    client,
    connected,
    loading,
    connect,
    disconnect,
  };
}