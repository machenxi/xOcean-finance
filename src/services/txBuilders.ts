// src/services/txBuilders.ts
import { RLUSD_ISSUER, RLUSD_CODE, POOL_ADDRESS } from '@/config/env';

// Set trust line (required before RLUSD transfers)
export const buildTrustSetTx = (account: string, limit = '1000000') => ({
  TransactionType: 'TrustSet',
  Account: account,
  LimitAmount: { currency: RLUSD_CODE, issuer: RLUSD_ISSUER, value: limit },
});

// Deposit RLUSD to pool (LP deposit)
export const buildDepositTx = (account: string, value: string) => ({
  TransactionType: 'Payment',
  Account: account,
  Destination: POOL_ADDRESS,
  Amount: { currency: RLUSD_CODE, issuer: RLUSD_ISSUER, value },
  Memos: [{ Memo: { MemoType: '584C5000', MemoData: '4445504F534954' } }], // 'XLP'/'DEPOSIT' hex optional
});

// Open loan (lock XRP collateral via EscrowCreate to custody)
// Drops = XRP * 1_000_000
export const buildEscrowCreateTx = (
  borrower: string,
  drops: string,
  finishAfterUnix: number,
  cancelAfterUnix: number
) => ({
  TransactionType: 'EscrowCreate',
  Account: borrower,
  Destination: POOL_ADDRESS,
  Amount: drops,
  FinishAfter: finishAfterUnix,
  CancelAfter: cancelAfterUnix,
  // Optional Condition for crypto‑condition based locks if orchestrator uses hashlock
});

// Repay loan (RLUSD back to pool)
export const buildRepayTx = (account: string, value: string) => ({
  TransactionType: 'Payment',
  Account: account,
  Destination: POOL_ADDRESS,
  Amount: { currency: RLUSD_CODE, issuer: RLUSD_ISSUER, value },
  Memos: [{ Memo: { MemoType: '5245504159', MemoData: '4C4F414E' } }], // 'REPAY'/'LOAN'
});

// Helper to convert XRP to drops
export const xrpToDrops = (xrp: number): string => {
  return (xrp * 1_000_000).toString();
};

// Helper to convert drops to XRP
export const dropsToXrp = (drops: string): number => {
  return Number(drops) / 1_000_000;
};