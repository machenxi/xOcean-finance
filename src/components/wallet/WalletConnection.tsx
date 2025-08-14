import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { useWallet } from '@/context/WalletProvider';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface WalletOption {
  id: 'crossmark' | 'gem' | 'xaman';
  name: string;
  description: string;
  icon: string;
  downloadUrl?: string;
  isPopular?: boolean;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'crossmark',
    name: 'Crossmark',
    description: 'Browser extension wallet for XRPL',
    icon: '🔗',
    downloadUrl: 'https://crossmark.io/',
    isPopular: true,
  },
  {
    id: 'gem',
    name: 'GemWallet',
    description: 'Secure XRPL wallet extension',
    icon: '💎',
    downloadUrl: 'https://gemwallet.app/',
  },
  {
    id: 'xaman',
    name: 'Xaman (XUMM)',
    description: 'Mobile-first XRPL wallet',
    icon: '📱',
    downloadUrl: 'https://xumm.app/',
    isPopular: true,
  },
];

interface WalletConnectionProps {
  className?: string;
  showBalance?: boolean;
  compact?: boolean;
}

export function WalletConnection({ 
  className, 
  showBalance = true, 
  compact = false 
}: WalletConnectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const { connected, address, network, connect, disconnect, adapter } = useWallet();
  const { toast } = useToast();

  const handleConnect = async (walletId: 'crossmark' | 'gem' | 'xaman') => {
    setConnectingWallet(walletId);
    try {
      await connect(walletId);
      setIsModalOpen(false);
      toast({
        title: 'Wallet Connected',
        description: `Successfully connected to ${WALLET_OPTIONS.find(w => w.id === walletId)?.name}`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Connection failed:', error);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive',
      });
    } finally {
      setConnectingWallet(null);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast({
      title: 'Wallet Disconnected',
      description: 'Successfully disconnected from wallet',
      variant: 'default',
    });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getWalletInfo = () => {
    if (!adapter) return null;
    return WALLET_OPTIONS.find(w => w.id === adapter.id);
  };

  // Compact view for connected state
  if (compact && connected) {
    const walletInfo = getWalletInfo();
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm font-medium">
            {walletInfo?.icon} {formatAddress(address!)}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  // Compact view for disconnected state
  if (compact && !connected) {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button className={className}>
            Connect Wallet
          </Button>
        </DialogTrigger>
        <WalletSelectionModal
          onConnect={handleConnect}
          connectingWallet={connectingWallet}
        />
      </Dialog>
    );
  }

  // Full card view
  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {connected ? (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              Wallet Connected
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              Connect Wallet
            </>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {connected ? (
          <div className="space-y-4">
            {/* Wallet Info */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getWalletInfo()?.icon}</span>
                  <span className="font-semibold">{getWalletInfo()?.name}</span>
                </div>
                <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                  {network || 'mainnet'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">Address:</span>
                  <div className="font-mono text-sm break-all">{address}</div>
                </div>
                
                {showBalance && (
                  <div>
                    <span className="text-sm text-muted-foreground">Balance:</span>
                    <div className="font-semibold">Loading... XRP</div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="flex-1"
              >
                Disconnect
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(address!);
                  toast({
                    title: 'Address Copied',
                    description: 'Wallet address copied to clipboard',
                    variant: 'success',
                  });
                }}
              >
                Copy Address
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your XRPL wallet to start lending and borrowing
            </p>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" size="lg">
                  Connect Wallet
                </Button>
              </DialogTrigger>
              <WalletSelectionModal
                onConnect={handleConnect}
                connectingWallet={connectingWallet}
              />
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Separate component for the wallet selection modal
interface WalletSelectionModalProps {
  onConnect: (walletId: 'crossmark' | 'gem' | 'xaman') => Promise<void>;
  connectingWallet: string | null;
}

function WalletSelectionModal({ onConnect, connectingWallet }: WalletSelectionModalProps) {
  const checkWalletAvailability = (walletId: string) => {
    switch (walletId) {
      case 'crossmark':
        return typeof window !== 'undefined' && !!window.crossmark;
      case 'gem':
        return typeof window !== 'undefined' && !!window.gemWallet;
      case 'xaman':
        return typeof window !== 'undefined' && !!window.Xumm;
      default:
        return false;
    }
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Connect Your Wallet</DialogTitle>
        <DialogDescription>
          Choose a wallet to connect to xOcean. Make sure you have the wallet installed and set up.
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-3">
        {WALLET_OPTIONS.map((wallet) => {
          const isAvailable = checkWalletAvailability(wallet.id);
          const isConnecting = connectingWallet === wallet.id;
          
          return (
            <div key={wallet.id} className="relative">
              <Button
                variant="outline"
                className={cn(
                  'w-full h-auto p-4 justify-start text-left',
                  !isAvailable && 'opacity-50',
                  wallet.isPopular && 'border-blue-200 bg-blue-50'
                )}
                onClick={() => isAvailable && onConnect(wallet.id)}
                disabled={!isAvailable || isConnecting}
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="text-2xl">{wallet.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{wallet.name}</span>
                      {wallet.isPopular && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {wallet.description}
                    </p>
                    {!isAvailable && (
                      <p className="text-xs text-red-600 mt-1">
                        Not installed
                      </p>
                    )}
                  </div>
                  {isConnecting && (
                    <LoadingSpinner size="sm" />
                  )}
                </div>
              </Button>
              
              {!isAvailable && wallet.downloadUrl && (
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(wallet.downloadUrl, '_blank');
                    }}
                    className="text-xs h-6 px-2"
                  >
                    Install
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="text-xs text-muted-foreground text-center mt-4">
        By connecting a wallet, you agree to our Terms of Service and Privacy Policy.
      </div>
    </DialogContent>
  );
}