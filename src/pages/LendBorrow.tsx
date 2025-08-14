// src/pages/LendBorrow.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/context/WalletProvider';
import { useBalance } from '@/hooks/useBalance';
import { useTrustline } from '@/hooks/useTrustline';
import { buildDepositTx, buildEscrowCreateTx, buildRepayTx, xrpToDrops } from '@/services/txBuilders';
import { getExplorerUrl } from '@/config/networks';

export default function LendBorrow() {
  const { connected, address, signAndSubmit, network } = useWallet();
  const { xrp, rlusd, refetch: refetchBalance } = useBalance();
  const { ensureTrustline, ensuring } = useTrustline();
  
  // Shared state
  const [activeTab, setActiveTab] = useState('lend');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Lending state
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  
  // Borrowing state
  const [collateralAmount, setCollateralAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [depositingCollateral, setDepositingCollateral] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [repaying, setRepaying] = useState(false);
  
  // Mock data - in real app, fetch from backend
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
  
  const clearTransactionState = () => {
    setTxHash(null);
    setError(null);
  };
  
  // Lending functions
  const handleDeposit = async () => {
    if (!connected || !address || !depositAmount) return;
    
    setDepositing(true);
    clearTransactionState();
    
    try {
      await ensureTrustline();
      const tx = buildDepositTx(address, depositAmount);
      const result = await signAndSubmit(tx);
      setTxHash(result.hash);
      setDepositAmount('');
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
    clearTransactionState();
    
    try {
      throw new Error('Withdrawal functionality requires backend integration');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw');
    } finally {
      setWithdrawing(false);
    }
  };
  
  // Borrowing functions
  const handleDepositCollateral = async () => {
    if (!connected || !address || !collateralAmount) return;
    
    setDepositingCollateral(true);
    clearTransactionState();
    
    try {
      const drops = xrpToDrops(parseFloat(collateralAmount));
      const finishAfter = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days
      const cancelAfter = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60); // 90 days
      
      const tx = buildEscrowCreateTx(address, drops, finishAfter, cancelAfter);
      const result = await signAndSubmit(tx);
      setTxHash(result.hash);
      setCollateralAmount('');
      setTimeout(() => refetchBalance(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deposit collateral');
    } finally {
      setDepositingCollateral(false);
    }
  };
  
  const handleBorrow = async () => {
    if (!connected || !borrowAmount) return;
    
    setBorrowing(true);
    clearTransactionState();
    
    try {
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
    clearTransactionState();
    
    try {
      const tx = buildRepayTx(address, repayAmount);
      const result = await signAndSubmit(tx);
      setTxHash(result.hash);
      setRepayAmount('');
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
              Please connect your wallet to access lending and borrowing features
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lending & Borrowing</h1>
        <p className="text-muted-foreground">
          Supply RLUSD to earn interest or borrow against XRP collateral
        </p>
      </div>
      
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{rlusd} RLUSD</div>
              <div className="text-xs text-muted-foreground">Available Balance</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{xrp} XRP</div>
              <div className="text-xs text-muted-foreground">Available Balance</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">0.00 xLP</div>
              <div className="text-xs text-muted-foreground">Lending Position</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className={`text-lg font-semibold ${
                parseFloat(activeLoan.healthFactor) > 1.5 ? 'text-green-600' : 
                parseFloat(activeLoan.healthFactor) > 1.2 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {activeLoan.healthFactor}
              </div>
              <div className="text-xs text-muted-foreground">Health Factor</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lend" className="flex items-center gap-2">
            💰 Lend
          </TabsTrigger>
          <TabsTrigger value="borrow" className="flex items-center gap-2">
            🏦 Borrow
          </TabsTrigger>
        </TabsList>
        
        {/* Lending Tab */}
        <TabsContent value="lend" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Supply RLUSD */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Supply RLUSD
                  <Badge variant="secondary">4.2% APY</Badge>
                </CardTitle>
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
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• First-time users need to set up a trustline</div>
                  <div>• Receive xLP tokens representing your share</div>
                  <div>• Interest earned automatically</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Withdraw RLUSD */}
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
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Withdrawal requires backend authorization</div>
                  <div>• xLP tokens burned upon withdrawal</div>
                  <div>• Receive RLUSD plus accrued interest</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Pool Information */}
          <Card>
            <CardHeader>
              <CardTitle>Pool Statistics</CardTitle>
              <CardDescription>Current lending pool information</CardDescription>
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
        </TabsContent>
        
        {/* Borrowing Tab */}
        <TabsContent value="borrow" className="space-y-6">
          {/* Active Loan Status */}
          <Card>
            <CardHeader>
              <CardTitle>Your Loan Position</CardTitle>
              <CardDescription>Current borrowing status and health metrics</CardDescription>
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
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                    disabled={depositingCollateral}
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
                  disabled={!collateralAmount || depositingCollateral}
                  className="w-full"
                >
                  {depositingCollateral ? 'Depositing...' : 'Deposit Collateral'}
                </Button>
              </CardContent>
            </Card>
            
            {/* Borrow RLUSD */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Borrow RLUSD
                  <Badge variant="destructive">6.8% APY</Badge>
                </CardTitle>
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
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Current borrow APY: 6.8%</div>
                  <div>• Liquidation at 75% LTV</div>
                  <div>• Interest accrues continuously</div>
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
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Partial repayments allowed</div>
                  <div>• Reduces liquidation risk</div>
                  <div>• Collateral released when fully repaid</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Risk Information */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Parameters</CardTitle>
              <CardDescription>Important borrowing information</CardDescription>
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
        </TabsContent>
      </Tabs>
      
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
    </div>
  );
}