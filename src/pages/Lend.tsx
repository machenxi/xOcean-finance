// src/pages/Lend.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/context/WalletProvider';
import { useBalance } from '@/hooks/useBalance';
import { useTrustline } from '@/hooks/useTrustline';
import { buildDepositTx } from '@/services/txBuilders';
import { getExplorerUrl } from '@/config/networks';

export default function Lend() {
  const { connected, address, signAndSubmit, network } = useWallet();
  const { rlusd, refetch: refetchBalance } = useBalance();
  const { ensureTrustline, ensuring } = useTrustline();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    if (!connected || !address || !depositAmount) return;
    
    setDepositing(true);
    setError(null);
    setTxHash(null);
    
    try {
      // First ensure trustline exists
      await ensureTrustline();
      
      // Then deposit
      const tx = buildDepositTx(address, depositAmount);
      const result = await signAndSubmit(tx);
      setTxHash(result.hash);
      setDepositAmount('');
      
      // Refresh balance after successful deposit
      setTimeout(() => refetchBalance(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deposit');
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!connected || !withdrawAmount) return;
    
    setWithdrawing(true);
    setError(null);
    setTxHash(null);
    
    try {
      // In Phase 1, withdrawal requires backend authorization
      // For now, we'll show a placeholder
      throw new Error('Withdrawal functionality requires backend integration');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw');
    } finally {
      setWithdrawing(false);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to start lending
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lend RLUSD</h1>
        <p className="text-muted-foreground">
          Supply RLUSD to the lending pool and earn interest
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Deposit Section */}
        <Card>
          <CardHeader>
            <CardTitle>Supply RLUSD</CardTitle>
            <CardDescription>
              Deposit RLUSD to earn interest from borrowers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Amount to Supply
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={depositing || ensuring}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Available: {rlusd} RLUSD
              </div>
            </div>
            
            <Button 
              onClick={handleDeposit}
              disabled={!depositAmount || depositing || ensuring}
              className="w-full"
            >
              {ensuring ? 'Setting up trustline...' : depositing ? 'Supplying...' : 'Supply RLUSD'}
            </Button>
            
            <div className="text-xs text-muted-foreground">
              • First-time users need to set up a trustline for RLUSD
              <br />
              • You'll receive xLP tokens representing your share
              <br />
              • Interest is earned automatically
            </div>
          </CardContent>
        </Card>

        {/* Withdraw Section */}
        <Card>
          <CardHeader>
            <CardTitle>Withdraw RLUSD</CardTitle>
            <CardDescription>
              Redeem your xLP tokens for RLUSD plus earned interest
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Amount to Withdraw
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={withdrawing}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Your xLP balance: 0.00 xLP (Phase 1 - Coming Soon)
              </div>
            </div>
            
            <Button 
              onClick={handleWithdraw}
              disabled={!withdrawAmount || withdrawing}
              variant="outline"
              className="w-full"
            >
              {withdrawing ? 'Withdrawing...' : 'Withdraw RLUSD'}
            </Button>
            
            <div className="text-xs text-muted-foreground">
              • Withdrawal requires backend authorization in Phase 1
              <br />
              • xLP tokens will be burned upon withdrawal
              <br />
              • You'll receive RLUSD plus accrued interest
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Status */}
      {(error || txHash) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="text-red-600 mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}
            {txHash && (
              <div className="text-green-600">
                <strong>Success!</strong> Transaction submitted.
                <br />
                <a 
                  href={getExplorerUrl(network || 'testnet', txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Explorer: {txHash.slice(0, 8)}...{txHash.slice(-8)}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pool Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Pool Information</CardTitle>
          <CardDescription>Current lending pool statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">4.2%</div>
              <div className="text-xs text-muted-foreground">Supply APY</div>
            </div>
            <div>
              <div className="text-lg font-semibold">68.5%</div>
              <div className="text-xs text-muted-foreground">Utilization</div>
            </div>
            <div>
              <div className="text-lg font-semibold">$1.25M</div>
              <div className="text-xs text-muted-foreground">Total Supplied</div>
            </div>
            <div>
              <div className="text-lg font-semibold">$393K</div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}