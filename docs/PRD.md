# RLUSD lending protocol (XRPL) with Crossmark & Gem Wallet integration

This is a XRPL DApps project of DeFi Lending Protocol like Aave which there are liquidity providers provide RLUSD into Liqudity Pool and get LP Token to represent shares in the pool that allow borrower over collateral the XRP to borrow RLUSD out from the pool and earn interest.
---

## Scope and goals

- **Core:** DeFi lending DApp (Phase 1) where LPs deposit RLUSD, receive xLP tokens, and earn interest from borrowers who lock XRP collateral to borrow RLUSD.
- **Phase 1 liquidity:** RLUSD for disbursement comes from circulating LP deposits and/or a platform treasury; XRP in the collective pool backs loans economically.
- **Collateralization:** Initial LTV 40%; maintenance margin at 75% of initial collateral; automated liquidation below threshold.
- **Yield split:** 70% LP rewards, 20% treasury, 10% reserve (insurance).
- **Risk controls:** Multi‑oracle price feed, margin calls, instant‑swap AMM liquidation fallback, Dutch auction fallback, RLUSD liquidity buffer 5–20%.
- **Wallet integrations:** Crossmark and Gem Wallet as primary; optional Xaman/XUMM deep‑link QR as mobile fallback.
- **Stack:** React 18 + Vite + Tailwind CSS + Shadcn UI; Node.js + TypeScript; PostgreSQL; xrpl.js; Hooks/AMM interactions (pseudo for Phase 1 custody); WebSocket + REST.

---

## Wallet support and UX

- **Supported wallets:**
  - **Crossmark (browser extension):** Connect, get address, sign, signAndSubmit XRPL tx JSON.
  - **Gem Wallet (browser extension):** Connect, get address, signAndSubmit XRPL tx JSON.
  - **Xaman/XUMM (optional fallback):** Deep link/QR for mobile sign‑in and tx signing.
- **Networks:** Mainnet, Testnet, Devnet selectable; show current network and address. Default to Testnet for safety.
- **UX flows:**
  - **Connect modal:** Wallet cards (Crossmark, Gem Wallet, Xaman). Disabled state if not installed. Install links in tooltip.
  - **Account/network changes:** Auto‑refresh balances, trust lines, health metrics.
  - **Transaction UX:** Preflight summary, fee estimate, spinner during signing, success toast with explorer link, error banner with reason.
  - **Security prompts:** Require trust line before RLUSD transfers; highlight issuer and currency code; confirm large amounts with extra step.

---

## Frontend structure and implementation

- **File tree (augment previous):**
  ```
  /src
   ├── wallets
   │    ├── types.ts
   │    ├── adapters
   │    │    ├── crossmark.ts
   │    │    ├── gem.ts
   │    │    └── xaman.ts        // optional fallback
   │    └── index.ts
   ├── context
   │    └── WalletProvider.tsx
   ├── components
   │    ├── ConnectWalletButton.tsx
   │    ├── ConnectModal.tsx
   │    ├── NetworkBadge.tsx
   │    ├── TxReviewSheet.tsx
   │    └── ...
   ├── hooks
   │    ├── useXRPL.ts
   │    ├── useBalance.ts
   │    └── useTrustline.ts
   ├── config
   │    ├── env.ts
   │    └── networks.ts
   └── ...
  ```

- **Type declarations for window providers (TypeScript):**
  ```ts
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
  ```

- **Crossmark adapter:**
  ```ts
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
  ```

- **Gem Wallet adapter:**
  ```ts
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
  ```

- **Optional Xaman/XUMM fallback adapter (QR/deep‑link):**
  ```ts
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
  ```

- **Wallet registry and selection:**
  ```ts
  // src/wallets/index.ts
  import { CrossmarkAdapter } from './adapters/crossmark';
  import { GemAdapter } from './adapters/gem';
  import { XamanAdapter } from './adapters/xaman';
  import type { WalletAdapter } from './types';

  export const WALLET_ADAPTERS: WalletAdapter[] = [CrossmarkAdapter, GemAdapter, XamanAdapter];
  ```

- **Wallet context with persistent selection:**
  ```tsx
  // src/context/WalletProvider.tsx
  import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
  import { WALLET_ADAPTERS } from '@/wallets';
  import type { WalletAdapter } from '@/wallets/types';

  type State = {
    adapter?: WalletAdapter;
    address?: string;
    network?: string;
    connected: boolean;
    connect: (id: WalletAdapter['id']) => Promise<void>;
    signAndSubmit: (tx: any) => Promise<{ hash: string }>;
    disconnect: () => void;
  };

  const Ctx = createContext<State>({ connected: false, async connect() {}, async signAndSubmit() { return { hash: '' }; }, disconnect() {} });

  export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [adapter, setAdapter] = useState<WalletAdapter>();
    const [address, setAddress] = useState<string>();
    const [network, setNetwork] = useState<string>();

    useEffect(() => {
      const saved = localStorage.getItem('wallet.adapter');
      if (saved) {
        const ad = WALLET_ADAPTERS.find(a => a.id === saved);
        if (ad && ad.isAvailable()) setAdapter(ad);
      }
    }, []);

    const connect = async (id: WalletAdapter['id']) => {
      const ad = WALLET_ADAPTERS.find(a => a.id === id);
      if (!ad) throw new Error('Wallet not supported');
      if (!ad.isAvailable()) throw new Error(`${ad.name} not available`);
      const res = await ad.connect();
      setAdapter(ad);
      setAddress(res.address);
      setNetwork(res.network);
      localStorage.setItem('wallet.adapter', id);
    };

    const signAndSubmit = async (tx: any) => {
      if (!adapter) throw new Error('No wallet connected');
      return adapter.signAndSubmit(tx);
    };

    const disconnect = () => {
      setAdapter(undefined);
      setAddress(undefined);
      setNetwork(undefined);
      localStorage.removeItem('wallet.adapter');
    };

    const value = useMemo(() => ({ adapter, address, network, connected: !!address, connect, signAndSubmit, disconnect }), [adapter, address, network]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  };

  export const useWallet = () => useContext(Ctx);
  ```

- **Connect UI (Shadcn dialog + cards):**
  ```tsx
  // src/components/ConnectWalletButton.tsx
  import { useState } from 'react';
  import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
  import { Button } from '@/components/ui/button';
  import { useWallet } from '@/context/WalletProvider';
  import { WALLET_ADAPTERS } from '@/wallets';

  export default function ConnectWalletButton() {
    const [open, setOpen] = useState(false);
    const { connect, connected, address } = useWallet();

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">{connected ? `${address?.slice(0,6)}...${address?.slice(-4)}` : 'Connect Wallet'}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Select a wallet</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            {WALLET_ADAPTERS.map(w => (
              <Button
                key={w.id}
                onClick={async () => { await connect(w.id); setOpen(false); }}
                variant={w.isAvailable() ? 'outline' : 'ghost'}
                disabled={!w.isAvailable() && w.id !== 'xaman'}
                className="h-20"
              >
                {w.name}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Crossmark & Gem Wallet require browser extensions. Xaman uses QR/deep‑link on mobile.
          </p>
        </DialogContent>
      </Dialog>
    );
  }
  ```

- **Network badge:**
  ```tsx
  // src/components/NetworkBadge.tsx
  import { useWallet } from '@/context/WalletProvider';
  export default function NetworkBadge() {
    const { network } = useWallet();
    return <span className="px-2 py-1 rounded bg-secondary text-xs">{network || 'Unknown network'}</span>;
  }
  ```

---

## XRPL transaction templates for app flows

- **Config:**
  ```ts
  // src/config/env.ts
  export const RLUSD_ISSUER = import.meta.env.VITE_RLUSD_ISSUER; // rXXXX...
  export const RLUCD_CODE = 'RLUSD';
  export const POOL_ADDRESS = import.meta.env.VITE_POOL_ADDRESS; // custody/pool account
  export const NETWORK = import.meta.env.VITE_XRPL_NETWORK || 'testnet'; // mainnet | testnet | devnet
  ```

- **Set trust line (required before RLUSD transfers):**
  ```ts
  export const buildTrustSetTx = (account: string, limit = '1000000') => ({
    TransactionType: 'TrustSet',
    Account: account,
    LimitAmount: { currency: 'RLUSD', issuer: RLUSD_ISSUER, value: limit },
  });
  ```

- **Deposit RLUSD to pool (LP deposit):**
  ```ts
  export const buildDepositTx = (account: string, value: string) => ({
    TransactionType: 'Payment',
    Account: account,
    Destination: POOL_ADDRESS,
    Amount: { currency: 'RLUSD', issuer: RLUSD_ISSUER, value },
    Memos: [{ Memo: { MemoType: '584C5000', MemoData: '4445504F534954' } }], // 'XLP'/'DEPOSIT' hex optional
  });
  ```

- **Withdraw RLUSD (LP redeem) — phase 1 pattern:**
  - **Client:** Calls backend to authorize withdrawal and construct a Payment from pool to LP.
  - **Backend:** Performs policy checks, then submits Payment from pool signer (server‑side). Client signs a lightweight authorization if needed.

- **Open loan (lock XRP collateral via EscrowCreate to custody):**
  ```ts
  // Drops = XRP * 1_000_000
  export const buildEscrowCreateTx = (borrower: string, drops: string, finishAfterUnix: number, cancelAfterUnix: number) => ({
    TransactionType: 'EscrowCreate',
    Account: borrower,
    Destination: POOL_ADDRESS,
    Amount: drops,
    FinishAfter: finishAfterUnix,
    CancelAfter: cancelAfterUnix,
    // Optional Condition for crypto‑condition based locks if orchestrator uses hashlock
  });
  ```

- **Borrow RLUSD (disbursement):**
  - **Backend:** After confirming escrow on‑ledger and LTV pass, submits RLUSD Payment from reserve/treasury to borrower.

- **Repay loan (RLUSD back to pool):**
  ```ts
  export const buildRepayTx = (account: string, value: string) => ({
    TransactionType: 'Payment',
    Account: account,
    Destination: POOL_ADDRESS,
    Amount: { currency: 'RLUSD', issuer: RLUSD_ISSUER, value },
    Memos: [{ Memo: { MemoType: '5245504159', MemoData: '4C4F414E' } }], // 'REPAY'/'LOAN'
  });
  ```

- **Liquidation path (backend):**
  - **Trigger:** Collateral ratio < maintenance. Backend creates AMM swap or auction.
  - **Actions:** Consume Escrow via EscrowFinish to custody, swap XRP→RLUSD via AMM, repay borrower’s debt, distribute surplus per policy.

- **Signing from UI:**
  ```ts
  // Example usage inside a component
  const { address, signAndSubmit } = useWallet();
  const onDeposit = async (amount: string) => {
    // 1) Ensure trustline
    await signAndSubmit(buildTrustSetTx(address!, '1000000'));
    // 2) Deposit
    const { hash } = await signAndSubmit(buildDepositTx(address!, amount));
    // Notify & refresh balances
  };
  ```

---

## Backend orchestrator notes

- **Endpoints:**
  - **POST /api/loans/open:** Input { borrower, collateralXRP, borrowRLUSD }. Returns { loanId, escrowParams }.
  - **POST /api/loans/repay:** Input { loanId, amount }. Returns { ok }.
  - **GET /api/pool/metrics:** TVL, utilization, APY, reserve buffer, interest split.
  - **POST /api/admin/params:** Update LTV, rates, buffers (auth‑gated).
- **Services:**
  - **Price oracle:** Median of multiple feeds; circuit breaker on divergence; cached snapshots.
  - **Liquidation bot:** Watches health factors; crafts EscrowFinish + AMM swap.
  - **XRPL service:** Submit and monitor transactions via WebSocket; map hashes to explorer URLs by network.
- **Database (PostgreSQL):**
  - **Tables:** lp_deposits, lp_shares, loans, liquidations, price_snapshots, distributions, events.
- **Security:**
  - **Allowlist custody accounts;** multi‑sig for pool movements; server never requests user secrets.
  - **Rate‑limit endpoints;** verify client‑submitted tx JSON conforms to intents (no destination spoofing).

---

## Generate these files and code

- **Frontend:**
  - **Wallet adapters** for Crossmark and Gem Wallet as above; optional Xaman stub.
  - **WalletProvider** context with persistent selection and signAndSubmit.
  - **Connect wallet UI** (dialog + button), **NetworkBadge**, **TxReviewSheet**.
  - **Hooks:** useBalance (fetch XRP and RLUSD balance via xrpl.js), useTrustline (detect/create trust line), useXRPL (network client).
  - **Pages:** Lend (deposit/withdraw), Borrow (open/repay, add collateral), Admin (params), Home (metrics).
  - **Styling:** Tailwind + Shadcn; responsive layouts; toasts for tx status.
  - **Env:** .env.example with VITE_RLUSD_ISSUER, VITE_POOL_ADDRESS, VITE_XRPL_NETWORK.

- **Backend (Node.js + TypeScript):**
  - **Routes:** /lp, /loans, /admin as outlined.
  - **Services:** xrplService (submit, subscribe), priceOracle (median), liquidationBot, kycService (stub).
  - **DB schema & migrations:** Prisma or SQL files for core tables.
  - **Config:** networks (wss endpoints), rate limits, CORS.

- **XRPL on‑chain (Phase 1 pseudo):**
  - **Custody model:** Pool and reserve accounts; Escrow for collateral; AMM integration for liquidations.
  - **State accounting:** Off‑chain ledger mapping to on‑chain txids; xLP share math based on pool value.

- **Testing:**
  - **Unit:** Wallet adapters (mock window providers), tx builders, price oracle math, LTV checks.
  - **Integration:** Open loan happy path on Testnet; liquidation trigger scenario.

- **DX scripts:**
  - **Dev:** yarn dev (frontend), yarn dev:server (backend), seeded .env.example.
  - **Build:** yarn build (frontend), yarn build:server (backend).
  - **Lint/format:** ESLint + Prettier.

---

## Example: balances and trust line hooks

```ts
// src/hooks/useBalance.ts
import { Client } from 'xrpl';
import { useEffect, useState } from 'react';
import { useWallet } from '@/context/WalletProvider';
import { RLUSD_ISSUER } from '@/config/env';

export function useBalance() {
  const { address } = useWallet();
  const [xrp, setXrp] = useState<string>('0');
  const [rlusd, setRlusd] = useState<string>('0');

  useEffect(() => {
    if (!address) return;
    const client = new Client(import.meta.env.VITE_XRPL_WSS || 'wss://s.altnet.rippletest.net:51233');
    (async () => {
      await client.connect();
      const acct = await client.request({ command: 'account_info', account: address, ledger_index: 'validated' });
      setXrp((Number(acct.result.account_data.Balance) / 1_000_000).toFixed(6));
      const lines = await client.request({ command: 'account_lines', account: address });
      const rl = lines.result.lines.find((l: any) => l.account === RLUSD_ISSUER && l.currency === 'RLUSD');
      setRlusd(rl?.balance ?? '0');
      await client.disconnect();
    })();
  }, [address]);

  return { xrp, rlusd };
}
```

```ts
// src/hooks/useTrustline.ts
import { useState } from 'react';
import { useWallet } from '@/context/WalletProvider';
import { buildTrustSetTx } from '@/services/txBuilders';

export function useTrustline() {
  const { address, signAndSubmit } = useWallet();
  const [ensuring, setEnsuring] = useState(false);

  const ensureTrustline = async () => {
    if (!address) throw new Error('Connect wallet first');
    setEnsuring(true);
    try {
      await signAndSubmit(buildTrustSetTx(address));
    } finally {
      setEnsuring(false);
    }
  };

  return { ensuring, ensureTrustline };
}
```

---

## Acceptance criteria

- **Wallet connectivity:** User can connect via Crossmark or Gem Wallet; address and network are detected and displayed.
- **Signing flow:** User can sign and submit TrustSet and Payment transactions via either wallet; hash is captured and shown with explorer link.
- **LP deposit:** Trust line flow is enforced; RLUSD deposit Payment is constructed and successfully submitted on Testnet.
- **Borrower collateral:** EscrowCreate is signed from the borrower; backend acknowledges escrow and disburses RLUSD from reserve on Testnet.
- **Resilience:** If a wallet is not installed, UI clearly indicates and offers install guidance; switching wallets works without reload.
- **Security guardrails:** Destination addresses for pool/reserve are fixed in config; client never signs arbitrary destinations.

---

If you want me to also include pre‑wired install links, explorer URLs per network, and a minimal Xaman deep‑link flow, say the word and I’ll append those modules.