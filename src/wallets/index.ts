// src/wallets/index.ts
import { CrossmarkAdapter } from './adapters/crossmark';
import { GemAdapter } from './adapters/gem';
import { XamanAdapter } from './adapters/xaman';
import type { WalletAdapter } from './types';

export const WALLET_ADAPTERS: WalletAdapter[] = [CrossmarkAdapter, GemAdapter, XamanAdapter];

export * from './types';
export { CrossmarkAdapter, GemAdapter, XamanAdapter };