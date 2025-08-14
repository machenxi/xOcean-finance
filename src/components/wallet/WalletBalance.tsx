import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading';
import { useWallet } from '@/context/WalletProvider';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

interface AssetBalance {
  currency: string;
  value: string;
  issuer?: string;
  name?: string;
  icon?: string;
}

interface WalletBalanceProps {
  className?: string;
  showAssets?: boolean;
  compact?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

// Mock function to simulate fetching wallet balances
const fetchWalletBalances = async (address: string): Promise<AssetBalance[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // Mock balance data
  const mockBalances: AssetBalance[] = [
    {
      currency: 'XRP',
      value: (Math.random() * 2000 + 500).toFixed(6),
      name: 'XRP',
      icon: '💎',
    },
    {
      currency: 'RLUSD',
      value: (Math.random() * 1000 + 100).toFixed(2),
      issuer: 'rhub8VRN55s94qWKDv6jmDy1pUykJzF3wq',
      name: 'RLUSD Stablecoin',
      icon: '💵',
    },
  ];
  
  // Sometimes simulate empty balances or errors
  if (Math.random() < 0.1) {
    throw new Error('Failed to fetch balances from XRPL network');
  }
  
  return mockBalances.filter(() => Math.random() > 0.3); // Randomly show some balances
};

export function WalletBalance({ 
  className, 
  showAssets = true, 
  compact = false,
  autoRefresh = false,
  refreshInterval = 30000 // 30 seconds
}: WalletBalanceProps) {
  const [balances, setBalances] = useState<AssetBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { connected, address } = useWallet();
  const { toast } = useToast();

  const refreshBalances = async (showToast = false) => {
    if (!connected || !address) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedBalances = await fetchWalletBalances(address);
      setBalances(fetchedBalances);
      setLastUpdated(new Date());
      
      if (showToast) {
        toast({
          title: 'Balances Updated',
          description: 'Wallet balances have been refreshed',
          variant: 'success',
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balances';
      setError(errorMessage);
      
      if (showToast) {
        toast({
          title: 'Refresh Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load when wallet connects
  useEffect(() => {
    if (connected && address) {
      refreshBalances();
    } else {
      setBalances([]);
      setLastUpdated(null);
      setError(null);
    }
  }, [connected, address]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !connected) return;
    
    const interval = setInterval(() => {
      refreshBalances();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, connected, refreshInterval]);

  const formatBalance = (value: string, currency: string) => {
    const num = parseFloat(value);
    if (num === 0) return '0';
    if (num < 0.000001) return '<0.000001';
    
    // Format based on currency
    if (currency === 'XRP') {
      return num.toFixed(6).replace(/\.?0+$/, '');
    } else {
      return num.toFixed(2);
    }
  };

  const getTotalValue = () => {
    // Mock RLUSD conversion rates
    const rates: Record<string, number> = {
      XRP: 0.52,
      RLUSD: 1.00,
    };
    
    return balances.reduce((total, balance) => {
      const rate = rates[balance.currency] || 0;
      return total + (parseFloat(balance.value) * rate);
    }, 0);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!connected) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            Connect your wallet to view balances
          </div>
        </CardContent>
      </Card>
    );
  }

  // Compact view
  if (compact) {
    const xrpBalance = balances.find(b => b.currency === 'XRP');
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border rounded-lg">
          <span className="text-sm font-medium">
            💎 {xrpBalance ? formatBalance(xrpBalance.value, 'XRP') : '0'} XRP
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refreshBalances(true)}
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : '🔄'}
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            💰 Wallet Balance
            {lastUpdated && (
              <span className="text-sm font-normal text-muted-foreground">
                • {formatTimeAgo(lastUpdated)}
              </span>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refreshBalances(true)}
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="sm" /> : '🔄'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error ? (
          <div className="text-center py-4">
            <div className="text-red-600 mb-2">⚠️ {error}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshBalances(true)}
              disabled={isLoading}
            >
              Try Again
            </Button>
          </div>
        ) : isLoading && balances.length === 0 ? (
          <div className="text-center py-8">
            <LoadingSpinner className="mx-auto mb-2" />
            <div className="text-muted-foreground">Loading balances...</div>
          </div>
        ) : balances.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No assets found in this wallet
          </div>
        ) : (
          <>
            {/* Total Value */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total Portfolio Value</div>
              <div className="text-2xl font-bold">
                ${getTotalValue().toFixed(2)}
              </div>
            </div>
            
            {/* Asset List */}
            {showAssets && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground mb-3">
                  Assets ({balances.length})
                </div>
                
                {balances.map((balance, index) => (
                  <div
                    key={`${balance.currency}-${balance.issuer || 'native'}-${index}`}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{balance.icon}</span>
                      <div>
                        <div className="font-semibold">
                          {balance.name || balance.currency}
                        </div>
                        {balance.issuer && (
                          <div className="text-xs text-muted-foreground font-mono">
                            {balance.issuer.slice(0, 8)}...{balance.issuer.slice(-6)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatBalance(balance.value, balance.currency)} {balance.currency}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ${(parseFloat(balance.value) * (balance.currency === 'XRP' ? 0.52 : 1.00)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Auto-refresh indicator */}
        {autoRefresh && connected && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Auto-refreshing every {Math.floor(refreshInterval / 1000)}s
          </div>
        )}
      </CardContent>
    </Card>
  );
}