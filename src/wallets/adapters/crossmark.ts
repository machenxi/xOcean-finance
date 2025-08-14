// src/wallets/adapters/crossmark.ts
import { WalletAdapter, XRPLTx } from '../types';

export const CrossmarkAdapter: WalletAdapter = {
  id: 'crossmark',
  name: 'Crossmark',
  isAvailable: () => typeof window !== 'undefined' && !!window.crossmark,
  async connect() {
    if (!this.isAvailable()) throw new Error('Crossmark not installed');
    const res = await window.crossmark.connect?.();
    // Fallbacks if API differs
    const address = res?.account ?? res?.address ?? (await window.crossmark.getAddress?.())?.address;
    const network = (await window.crossmark.getNetwork?.())?.network;
    if (!address) throw new Error('Unable to get address from Crossmark');
    return { address, network };
  },
  async getAddress() {
    const { address } = await this.connect();
    return address;
  },
  async signAndSubmit(tx: XRPLTx) {
    if (!this.isAvailable()) throw new Error('Crossmark not installed');
    const res = await window.crossmark.signAndSubmit?.(tx);
    const hash = res?.txid ?? res?.hash ?? res?.result?.hash;
    if (!hash) throw new Error('Crossmark did not return a tx hash');
    return { hash };
  },
};