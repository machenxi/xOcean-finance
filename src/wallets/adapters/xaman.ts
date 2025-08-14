// src/wallets/adapters/xaman.ts
import { WalletAdapter, XRPLTx } from '../types';

export const XamanAdapter: WalletAdapter = {
  id: 'xaman',
  name: 'Xaman (XUMM)',
  isAvailable: () => true, // Use QR/deep-link even if no extension
  async connect() {
    // For MVP: return placeholder; address will be resolved post-sign-in flow handled server-side or via SDK
    return { address: '' };
  },
  async getAddress() {
    return '';
  },
  async signAndSubmit(_tx: XRPLTx) {
    throw new Error('Implement Xaman deep-link flow if enabled');
  },
};