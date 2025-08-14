// src/config/env.ts
export const RLUSD_ISSUER = import.meta.env.VITE_RLUSD_ISSUER; // rXXXX...
export const RLUSD_CODE = 'RLUSD';
export const POOL_ADDRESS = import.meta.env.VITE_POOL_ADDRESS; // custody/pool account
export const NETWORK = import.meta.env.VITE_XRPL_NETWORK || 'testnet'; // mainnet | testnet | devnet
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
export const XRPL_WSS = import.meta.env.VITE_XRPL_WSS || 'wss://s.altnet.rippletest.net:51233';