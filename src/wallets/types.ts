// src/wallets/types.ts
export type XRPLTx = Record<string, any>;

export interface WalletAdapter {
  id: 'crossmark' | 'gem' | 'xaman';
  name: string;
  isAvailable(): boolean;
  connect(): Promise<{ address: string; network?: string }>;
  getAddress(): Promise<string>;
  signAndSubmit(tx: XRPLTx): Promise<{ hash: string }>;
  signOnly?(tx: XRPLTx): Promise<{ txBlob: string }>;
  getNetwork?(): Promise<string>;
  disconnect?(): Promise<void>;
}

declare global {
  interface Window {
    crossmark?: any;
    gemWallet?: any;
    Xumm?: any;
  }
}