// src/wallets/adapters/gem.ts
import { WalletAdapter, XRPLTx } from '../types';

export const GemAdapter: WalletAdapter = {
  id: 'gem',
  name: 'Gem Wallet',
  isAvailable: () => typeof window !== 'undefined' && !!window.gemWallet,
  async connect() {
    if (!this.isAvailable()) throw new Error('Gem Wallet not installed');
    await window.gemWallet.connect?.();
    const address = (await window.gemWallet.getAddress?.()) || (await window.gemWallet.request?.({ method: 'getAddress' }));
    const network = (await window.gemWallet.getNetwork?.())?.network;
    if (!address) throw new Error('Unable to get address from Gem Wallet');
    return { address, network };
  },
  async getAddress() {
    const { address } = await this.connect();
    return address;
  },
  async signAndSubmit(tx: XRPLTx) {
    if (!this.isAvailable()) throw new Error('Gem Wallet not installed');
    const res = await (window.gemWallet.signAndSubmit?.(tx) || window.gemWallet.request?.({ method: 'signAndSubmit', params: { tx } }));
    const hash = res?.hash || res?.txid || res?.result?.hash;
    if (!hash) throw new Error('Gem Wallet did not return a tx hash');
    return { hash };
  },
};