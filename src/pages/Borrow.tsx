// src/pages/Borrow.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWallet } from '@/context/WalletProvider';
import { useBalance } from '@/hooks/useBalance';
import { buildEscrowCreateTx, buildRepayTx, xrpToDrops } from '@/services/txBuilders';
import { getExplorerUrl } from '@/config/networks';

export default function Borrow() {
  const { connected, address, signAndSubmit, network } = useWallet();
  const { xrp, rlusd, refetch: refetchBalance } = useBalance();
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [repaying, setRepaying] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mock loan data - in real app, fetch from backend
  const [activeLoan] = useState({
    collateral: '1000', // XRP
    borrowed: '200', // RLUSD
    healthFactor: '1.85',
    liquidationPrice: '0.30', // RLUSD per XRP
  });

  const maxLTV = 0.4; // 40% LTV
  const liquidationLTV = 0.75; // 75% liquidation threshold

  const calculateMaxBorrow = (collateral: string) => {
    const xrpAmount = parseFloat(collateral) || 0;
    // Assuming 1 XRP = 0.50 RLUSD for calculation
    const xrpPrice = 0.50;
    return (xrpAmount * xrpPrice * maxLTV).toFixed(2);
  };

  const handleDepositCollateral = async () => {
    if (!connected || !address || !collateralAmount) return;
    
    setDepositing(true);
    setError(null);
    setTxHash(null);
    
    try {
      const drops = xrpToDrops(parseFloat(collateralAmount));
      const finishAfter = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days
      const cancelAfter = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60); // 90 days
      
      const tx = buildEscrowCreateTx(address, drops, finishAfter, cancelAfter);
      const result = await signAndSubmit(tx);
      setTxHash(result.hash);
      setCollateralAmount('');
      
      // Refresh balance after successful deposit
      setTimeout(() => refetchBalance(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deposit collateral');
    } finally {
      setDepositing(false);
    }
  };

  const handleBorrow = async () => {
    if (!connected || !borrowAmount) return;
    
    setBorrowing(true);
    setError(null);
    
    try {
      // In Phase 1, borrowing requires backend coordination
      // Backend will verify collateral and disburse RLUSD
      throw new Error('Borrowing requires backend integration for loan approval');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to borrow');
    } finally {
      setBorrowing(false);
    }
  };

  const handleRepay = async () => {
    if (!connected || !address || !repayAmount) return;
    
    setRepaying(true);
    setError(null);
    setTxHash(null);
    
    try {
      const tx = buildRepayTx(address, repayAmount);
      const result = await signAndSubmit(tx);
      setTxHash(result.hash);
      setRepayAmount('');
      
      // Refresh balance after successful repayment
      setTimeout(() => refetchBalance(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to repay loan');
    } finally {
      setRepaying(false);
    }
  };

  if (!connected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to start borrowing
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Borrow RLUSD</h1>
        <p className="text-muted-foreground">
          Lock XRP as collateral to borrow RLUSD
        </p>
      </div>

      {/* Active Loan Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Loan Status</CardTitle>
          <CardDescription>Current borrowing position</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{activeLoan.collateral} XRP</div>
              <div className="text-xs text-muted-foreground">Collateral</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{activeLoan.borrowed} RLUSD</div>
              <div className="text-xs text-muted-foreground">Borrowed</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                parseFloat(activeLoan.healthFactor) > 1.5 ? 'text-green-600' : 
                parseFloat(activeLoan.healthFactor) > 1.2 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {activeLoan.healthFactor}
              </div>
              <div className="text-xs text-muted-foreground">Health Factor</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">${activeLoan.liquidationPrice}</div>
              <div className="text-xs text-muted-foreground">Liquidation Price</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deposit Collateral */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit Collateral</CardTitle>
            <CardDescription>
              Lock XRP to secure your loan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                XRP Amount
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                disabled={depositing}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Available: {xrp} XRP
              </div>
            </div>
            
            {collateralAmount && (
              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                Max borrow: {calculateMaxBorrow(collateralAmount)} RLUSD
                <br />
                (40% LTV ratio)
              </div>
            )}
            
            <Button 
              onClick={handleDepositCollateral}
              disabled={!collateralAmount || depositing}
              className="w-full"
            >
              {depositing ? 'Depositing...' : 'Deposit Collateral'}
            </Button>
          </CardContent>
        </Card>

        {/* Borrow RLUSD */}
        <Card>
          <CardHeader>
            <CardTitle>Borrow RLUSD</CardTitle>
            <CardDescription>
              Borrow against your collateral
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                RLUSD Amount
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                disabled={borrowing}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Available to borrow: 200.00 RLUSD
              </div>
            </div>
            
            <Button 
              onClick={handleBorrow}
              disabled={!borrowAmount || borrowing}
              className="w-full"
            >
              {borrowing ? 'Borrowing...' : 'Borrow RLUSD'}
            </Button>
            
            <div className="text-xs text-muted-foreground">
              • Current borrow APY: 6.8%
              • Liquidation at 75% LTV
              • Interest accrues continuously
            </div>
          </CardContent>
        </Card>

        {/* Repay Loan */}
        <Card>
          <CardHeader>
            <CardTitle>Repay Loan</CardTitle>
            <CardDescription>
              Repay RLUSD to reduce debt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                RLUSD Amount
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                disabled={repaying}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Your RLUSD: {rlusd} RLUSD
                <br />
                Outstanding debt: {activeLoan.borrowed} RLUSD
              </div>
            </div>
            
            <Button 
              onClick={handleRepay}
              disabled={!repayAmount || repaying}
              variant="outline"
              className="w-full"
            >
              {repaying ? 'Repaying...' : 'Repay RLUSD'}
            </Button>
            
            <div className="text-xs text-muted-foreground">
              • Partial repayments allowed
              • Reduces liquidation risk
              • Collateral released when fully repaid
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

      {/* Risk Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Risk Information</CardTitle>
          <CardDescription>Important borrowing parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">40%</div>
              <div className="text-xs text-muted-foreground">Maximum LTV</div>
              <div className="text-xs mt-1">Initial loan-to-value ratio</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">75%</div>
              <div className="text-xs text-muted-foreground">Liquidation Threshold</div>
              <div className="text-xs mt-1">Automatic liquidation trigger</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">6.8%</div>
              <div className="text-xs text-muted-foreground">Borrow APY</div>
              <div className="text-xs mt-1">Current interest rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}