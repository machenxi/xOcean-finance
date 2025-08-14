// src/types/global.d.ts
import { Buffer } from 'buffer';

declare global {
  interface Window {
    Buffer: typeof Buffer;
    crossmark?: any;
    gemWallet?: any;
    Xumm?: any;
  }
}

export {};