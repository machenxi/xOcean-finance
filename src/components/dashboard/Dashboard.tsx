import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading';

import { WalletBalance } from '../wallet/WalletBalance';
import { LendingForm } from '../lending/LendingForm';
import { BorrowingForm } from '../lending/BorrowingForm';
import { LendingPositionCard } from '../lending/LendingPositionCard';
import { InterestRateDisplay } from '../lending/InterestRateDisplay';
import { useWallet } from '@/context/WalletProvider';
import { useToast } from '@/hooks/useToast';
import { getXRPLService } from '@/services/xrpl';
import { cn } from '@/lib/utils';

interface MarketStats {
  totalLiquidity: string;
  totalBorrowed: string;
  averageAPY: number;
  activeOffers: number;
}

interface LendingPosition {
  id: string;
  type: 'lending' | 'borrowing';
  asset: string;
  amount: string;
  interestRate: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'liquidated';
  earned?: string;
  collateralAsset?: string;
  collateralAmount?: string;
}

interface DashboardProps {
  className?: string;
}

// Mock data for user positions
const MOCK_POSITIONS: LendingPosition[] = [
  {
    id: '1',
    type: 'lending',
    asset: 'XRP',
    amount: '1000.000000',
    interestRate: 8.5,
    startDate: new Date(Date.now() - 86400000 * 15),
    endDate: new Date(Date.now() + 86400000 * 15),
    status: 'active',
    earned: '35.416667',
  },
  {
    id: '2',
    type: 'borrowing',
    asset: 'RLUSD',
    amount: '500.00',
    interestRate: 6.2,
    startDate: new Date(Date.now() - 86400000 * 10),
    endDate: new Date(Date.now() + 86400000 * 50),
    status: 'active',
    collateralAsset: 'XRP',
    collateralAmount: '1500.000000',
  },
  {
    id: '3',
    type: 'lending',
    asset: 'RLUSD',
    amount: '300.00',
    interestRate: 5.8,
    startDate: new Date(Date.now() - 86400000 * 45),
    endDate: new Date(Date.now() - 86400000 * 5),
    status: 'completed',
    earned: '8.75',
  },
];

const SUPPORTED_ASSETS = [
  {
    symbol: 'XRP',
    name: 'XRP',
    icon: '💎',
    balance: '1000.00',
    price: 0.52,
    borrowRate: 8.5,
    lendRate: 7.8,
  },
  {
    symbol: 'RLUSD',
    name: 'RLUSD Stablecoin',
    icon: '💵',
    balance: '500.00',
    price: 1.00,
    borrowRate: 6.2,
    lendRate: 5.8,
  },
];

export function Dashboard({ className }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'lend' | 'borrow'>('overview');
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [userPositions, setUserPositions] = useState<LendingPosition[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  
  const { connected, address } = useWallet();
  const { toast } = useToast();
  const xrplService = getXRPLService();

  // Load market stats
  useEffect(() => {
    loadMarketStats();
  }, []);

  // Load user positions when wallet connects
  useEffect(() => {
    if (connected && address) {
      loadUserPositions();
    } else {
      setUserPositions([]);
    }
  }, [connected, address]);

  const loadMarketStats = async () => {
    setIsLoadingStats(true);
    try {
      const stats = await xrplService.getMarketStats();
      setMarketStats(stats);
    } catch (error) {
      console.error('Failed to load market stats:', error);
      toast({
        title: 'Failed to Load Market Data',
        description: 'Unable to fetch current market statistics',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadUserPositions = async () => {
    if (!address) return;
    
    setIsLoadingPositions(true);
    try {
      // In a real implementation, this would fetch user-specific positions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter mock positions to simulate user-specific data
      const userSpecificPositions = MOCK_POSITIONS.filter(() => Math.random() > 0.3);
      setUserPositions(userSpecificPositions);
    } catch (error) {
      console.error('Failed to load user positions:', error);
      toast({
        title: 'Failed to Load Positions',
        description: 'Unable to fetch your lending/borrowing positions',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPositions(false);
    }
  };

  const calculatePortfolioStats = () => {
    const activePositions = userPositions.filter(p => p.status === 'active');
    const lendingPositions = activePositions.filter(p => p.type === 'lending');
    const borrowingPositions = activePositions.filter(p => p.type === 'borrowing');
    
    const totalLent = lendingPositions.reduce((sum, pos) => {
      const price = SUPPORTED_ASSETS.find(a => a.symbol === pos.asset)?.price || 1;
      return sum + (parseFloat(pos.amount) * price);
    }, 0);
    
    const totalBorrowed = borrowingPositions.reduce((sum, pos) => {
      const price = SUPPORTED_ASSETS.find(a => a.symbol === pos.asset)?.price || 1;
      return sum + (parseFloat(pos.amount) * price);
    }, 0);
    
    const totalEarned = userPositions.reduce((sum, pos) => {
      if (pos.type === 'lending' && pos.earned) {
        const price = SUPPORTED_ASSETS.find(a => a.symbol === pos.asset)?.price || 1;
        return sum + (parseFloat(pos.earned) * price);
      }
      return sum;
    }, 0);
    
    return {
      totalLent,
      totalBorrowed,
      totalEarned,
      netPosition: totalLent - totalBorrowed,
      activePositions: activePositions.length,
    };
  };

  const portfolioStats = calculatePortfolioStats();

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Liquidity</div>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <LoadingSpinner size="sm" />
              ) : (
                `$${marketStats?.totalLiquidity ? parseFloat(marketStats.totalLiquidity).toLocaleString() : '0'}`
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Borrowed</div>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <LoadingSpinner size="sm" />
              ) : (
                `$${marketStats?.totalBorrowed ? parseFloat(marketStats.totalBorrowed).toLocaleString() : '0'}`
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Average APY</div>
            <div className="text-2xl font-bold text-green-600">
              {isLoadingStats ? (
                <LoadingSpinner size="sm" />
              ) : (
                `${marketStats?.averageAPY?.toFixed(1) || '0.0'}%`
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Active Offers</div>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <LoadingSpinner size="sm" />
              ) : (
                marketStats?.activeOffers?.toLocaleString() || '0'
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Portfolio Stats */}
      {connected && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Lent</div>
              <div className="text-xl font-bold text-blue-600">
                ${portfolioStats.totalLent.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Borrowed</div>
              <div className="text-xl font-bold text-orange-600">
                ${portfolioStats.totalBorrowed.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Earned</div>
              <div className="text-xl font-bold text-green-600">
                ${portfolioStats.totalEarned.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Net Position</div>
              <div className={cn(
                'text-xl font-bold',
                portfolioStats.netPosition >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                ${portfolioStats.netPosition.toFixed(2)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Active Positions</div>
              <div className="text-xl font-bold">
                {portfolioStats.activePositions}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interest Rates */}
      <InterestRateDisplay assets={SUPPORTED_ASSETS} view="detailed" />

      {/* User Positions */}
      {connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Positions</span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadUserPositions}
                disabled={isLoadingPositions}
              >
                {isLoadingPositions ? <LoadingSpinner size="sm" /> : '🔄'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPositions ? (
              <div className="text-center py-8">
                <LoadingSpinner className="mx-auto mb-2" />
                <div className="text-muted-foreground">Loading your positions...</div>
              </div>
            ) : userPositions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-lg font-medium mb-1">No positions yet</div>
                <div className="text-sm">Start lending or borrowing to see your positions here</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPositions.map((position) => (
                  <LendingPositionCard
                    key={position.id}
                    position={{
                      id: position.id,
                      asset: position.asset,
                      amount: position.amount,
                      interestRate: position.interestRate,
                      startDate: position.startDate,
                      endDate: position.endDate,
                      status: position.status,
                      type: position.type,
                      earned: position.earned,
                      collateralAsset: position.collateralAsset,
                      collateralAmount: position.collateralAmount,
                    }}
                    onWithdraw={async (id) => {
                      toast({
                        title: 'Withdrawal Initiated',
                        description: 'Your withdrawal request is being processed',
                        variant: 'success',
                      });
                      // Refresh positions after withdrawal
                      setTimeout(loadUserPositions, 2000);
                    }}
                    onExtend={async (id, newEndDate) => {
                      toast({
                        title: 'Position Extended',
                        description: 'Your position has been extended successfully',
                        variant: 'success',
                      });
                      // Refresh positions after extension
                      setTimeout(loadUserPositions, 2000);
                    }}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className={cn('w-full max-w-7xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🌊 xOcean Dashboard</h1>
        <p className="text-muted-foreground">
          Decentralized lending and borrowing on the XRPL
        </p>
      </div>

      {/* Wallet Balance (when connected) */}
      {connected && (
        <div className="mb-6">
          <WalletBalance showAssets={false} compact={true} autoRefresh={true} />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
          className="rounded-md"
        >
          📊 Overview
        </Button>
        <Button
          variant={activeTab === 'lend' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('lend')}
          className="rounded-md"
        >
          💰 Lend
        </Button>
        <Button
          variant={activeTab === 'borrow' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('borrow')}
          className="rounded-md"
        >
          📈 Borrow
        </Button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'overview' && renderOverviewTab()}
        
        {activeTab === 'lend' && (
          <div className="space-y-6">
            <LendingForm
              onSubmit={async (data) => {
                // Handle lending submission
                console.log('Lending data:', data);
                // Refresh positions after successful lending
                setTimeout(loadUserPositions, 2000);
              }}
            />
            
            {/* Recent lending offers could go here */}
          </div>
        )}
        
        {activeTab === 'borrow' && (
          <div className="space-y-6">
            <BorrowingForm
              onSubmit={async (data) => {
                // Handle borrowing submission
                console.log('Borrowing data:', data);
                // Refresh positions after successful borrowing
                setTimeout(loadUserPositions, 2000);
              }}
            />
            
            {/* Available borrowing offers could go here */}
          </div>
        )}
      </div>
    </div>
  );
}