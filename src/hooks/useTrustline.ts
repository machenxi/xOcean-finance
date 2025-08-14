// src/hooks/useTrustline.ts
import { useState } from 'react';
import { useWallet } from '@/context/WalletProvider';
import { buildTrustSetTx } from '@/services/txBuilders';

export function useTrustline() {
  const { address, signAndSubmit } = useWallet();
  const [ensuring, setEnsuring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureTrustline = async (limit = '1000000') => {
    if (!address) throw new Error('Connect wallet first');
    
    setEnsuring(true);
    setError(null);
    
    try {
      const tx = buildTrustSetTx(address, limit);
      const result = await signAndSubmit(tx);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set trustline';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setEnsuring(false);
    }
  };

  return {
    ensuring,
    error,
    ensureTrustline,
  };
}