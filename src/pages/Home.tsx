// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/context/WalletProvider';
import { useBalance } from '@/hooks/useBalance';
import { Link } from 'react-router-dom';

interface PoolMetrics {
  tvl: string;
  utilization: string;
  supplyApy: string;
  borrowApy: string;
  totalSupplied: string;
  totalBorrowed: string;
  availableLiquidity: string;
}

export default function Home() {
  const { connected } = useWallet();
  const { xrp, rlusd, loading: balanceLoading } = useBalance();
  const [metrics, setMetrics] = useState<PoolMetrics>({
    tvl: '0',
    utilization: '0',
    supplyApy: '0',
    borrowApy: '0',
    totalSupplied: '0',
    totalBorrowed: '0',
    availableLiquidity: '0',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching pool metrics
    // In a real app, this would fetch from your backend API
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        // Simulated data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMetrics({
          tvl: '1,250,000',
          utilization: '68.5',
          supplyApy: '4.2',
          borrowApy: '6.8',
          totalSupplied: '1,250,000',
          totalBorrowed: '856,250',
          availableLiquidity: '393,750',
        });
      } catch (error) {
        console.error('Failed to fetch pool metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">xOcean Lending Protocol</h1>
        <p className="text-lg text-muted-foreground">
          Decentralized lending on XRPL with RLUSD and XRP collateral
        </p>
      </div>

      {/* Pool Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Value Locked</CardDescription>
            <CardTitle className="text-2xl">
              {loading ? '...' : `$${metrics.tvl}`}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Utilization Rate</CardDescription>
            <CardTitle className="text-2xl">
              {loading ? '...' : `${metrics.utilization}%`}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Supply APY</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {loading ? '...' : `${metrics.supplyApy}%`}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Borrow APY</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {loading ? '...' : `${metrics.borrowApy}%`}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Balances */}
        {connected && (
          <Card>
            <CardHeader>
              <CardTitle>Your Balances</CardTitle>
              <CardDescription>Current wallet balances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">XRP</span>
                  <span className="text-lg">
                    {balanceLoading ? '...' : `${xrp} XRP`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">RLUSD</span>
                  <span className="text-lg">
                    {balanceLoading ? '...' : `${rlusd} RLUSD`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {connected ? 'Start lending or borrowing' : 'Connect your wallet to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/lend" className="block">
                <Button className="w-full" disabled={!connected}>
                  Supply RLUSD
                </Button>
              </Link>
              <Link to="/borrow" className="block">
                <Button variant="outline" className="w-full" disabled={!connected}>
                  Borrow RLUSD
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Pool Statistics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pool Statistics</CardTitle>
            <CardDescription>Current lending pool status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {loading ? '...' : `$${metrics.totalSupplied}`}
                </div>
                <div className="text-sm text-muted-foreground">Total Supplied</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {loading ? '...' : `$${metrics.totalBorrowed}`}
                </div>
                <div className="text-sm text-muted-foreground">Total Borrowed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {loading ? '...' : `$${metrics.availableLiquidity}`}
                </div>
                <div className="text-sm text-muted-foreground">Available Liquidity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}