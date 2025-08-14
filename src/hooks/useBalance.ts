// src/hooks/useBalance.ts
import { Client } from 'xrpl';
import { useEffect, useState } from 'react';
import { useWallet } from '@/context/WalletProvider';
import { RLUSD_ISSUER } from '@/config/env';
import { getNetworkConfig } from '@/config/networks';

export function useBalance() {
  const { address, network } = useWallet();
  const [xrp, setXrp] = useState<string>('0');
  const [rlusd, setRlusd] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!address) {
      setXrp('0');
      setRlusd('0');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const networkConfig = getNetworkConfig(network || 'testnet');
      const client = new Client(networkConfig.wss);
      await client.connect();
      
      // Get XRP balance
      const acct = await client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });
      setXrp((Number(acct.result.account_data.Balance) / 1_000_000).toFixed(6));
      
      // Get RLUSD balance
      const lines = await client.request({
        command: 'account_lines',
        account: address
      });
      const rl = lines.result.lines.find((l: any) => 
        l.account === RLUSD_ISSUER && l.currency === 'RLUSD'
      );
      setRlusd(rl?.balance ?? '0');
      
      await client.disconnect();
    } catch (err) {
      console.error('Failed to fetch balances:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [address, network]);

  return {
    xrp,
    rlusd,
    loading,
    error,
    refetch: fetchBalances,
  };
}