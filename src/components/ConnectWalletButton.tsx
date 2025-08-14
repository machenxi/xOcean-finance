// src/components/ConnectWalletButton.tsx
import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/context/WalletProvider';
import { WALLET_ADAPTERS } from '@/wallets';

export default function ConnectWalletButton() {
  const [open, setOpen] = useState(false);
  const { connect, connected, address, disconnect } = useWallet();

  const handleConnect = async (id: any) => {
    try {
      await connect(id);
      setOpen(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // You might want to show a toast notification here
    }
  };

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </span>
        <Button variant="outline" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Connect Wallet</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a wallet</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3">
          {WALLET_ADAPTERS.map(w => (
            <Button
              key={w.id}
              onClick={() => handleConnect(w.id)}
              variant={w.isAvailable() ? 'outline' : 'ghost'}
              disabled={!w.isAvailable() && w.id !== 'xaman'}
              className="h-16 justify-start text-left"
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{w.name}</span>
                <span className="text-xs text-muted-foreground">
                  {!w.isAvailable() && w.id !== 'xaman' ? 'Not installed' : 'Available'}
                </span>
              </div>
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