import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LoadingSpinner } from '../ui/loading';
import { AssetSelector } from './AssetSelector';
import { InterestRateDisplay } from './InterestRateDisplay';
import { TransactionConfirmation, TransactionDetails } from './TransactionConfirmation';
import { useToast } from '@/hooks/useToast';
import { useWallet } from '@/context/WalletProvider';
import { cn } from '@/lib/utils';

interface CollateralInfo {
  asset: string;
  amount: string;
  value: number;
  ltv: number; // Loan-to-Value ratio
  liquidationThreshold: number;
}

interface BorrowingFormData {
  borrowAsset: string;
  borrowAmount: string;
  collateralAsset: string;
  collateralAmount: string;
  duration: number;
  interestRate: number;
}

interface BorrowingFormProps {
  onSubmit?: (data: BorrowingFormData) => Promise<void>;
  className?: string;
}

// Mock data for supported assets and their borrowing parameters
const SUPPORTED_ASSETS = [
  {
    symbol: 'XRP',
    name: 'XRP',
    icon: '💎',
    balance: '1000.00',
    price: 0.52,
    maxLTV: 0.75,
    liquidationThreshold: 0.80,
    borrowRate: 8.5,
  },
  {
    symbol: 'RLUSD',
    name: 'RLUSD Stablecoin',
    icon: '💵',
    balance: '500.00',
    price: 1.00,
    maxLTV: 0.85,
    liquidationThreshold: 0.90,
    borrowRate: 6.2,
  },
];

export function BorrowingForm({ onSubmit, className }: BorrowingFormProps) {
  const [formData, setFormData] = useState<BorrowingFormData>({
    borrowAsset: '',
    borrowAmount: '',
    collateralAsset: '',
    collateralAmount: '',
    duration: 30,
    interestRate: 0,
  });
  
  const [collateralInfo, setCollateralInfo] = useState<CollateralInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const { address, isConnected } = useWallet();

  // Calculate collateral requirements when borrow amount or assets change
  useEffect(() => {
    if (formData.borrowAsset && formData.borrowAmount && formData.collateralAsset) {
      calculateCollateralRequirements();
    }
  }, [formData.borrowAsset, formData.borrowAmount, formData.collateralAsset]);

  const calculateCollateralRequirements = () => {
    const borrowAsset = SUPPORTED_ASSETS.find(a => a.symbol === formData.borrowAsset);
    const collateralAsset = SUPPORTED_ASSETS.find(a => a.symbol === formData.collateralAsset);
    
    if (!borrowAsset || !collateralAsset || !formData.borrowAmount) return;
    
    const borrowValue = parseFloat(formData.borrowAmount) * borrowAsset.price;
    const requiredCollateralValue = borrowValue / collateralAsset.maxLTV;
    const requiredCollateralAmount = requiredCollateralValue / collateralAsset.price;
    
    const currentCollateralValue = parseFloat(formData.collateralAmount || '0') * collateralAsset.price;
    const currentLTV = borrowValue / currentCollateralValue;
    
    setCollateralInfo({
      asset: collateralAsset.symbol,
      amount: requiredCollateralAmount.toFixed(6),
      value: requiredCollateralValue,
      ltv: currentLTV,
      liquidationThreshold: collateralAsset.liquidationThreshold,
    });
    
    // Update interest rate based on selected asset
    setFormData(prev => ({
      ...prev,
      interestRate: borrowAsset.borrowRate,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.borrowAsset) {
      newErrors.borrowAsset = 'Please select an asset to borrow';
    }
    
    if (!formData.borrowAmount || parseFloat(formData.borrowAmount) <= 0) {
      newErrors.borrowAmount = 'Please enter a valid borrow amount';
    }
    
    if (!formData.collateralAsset) {
      newErrors.collateralAsset = 'Please select a collateral asset';
    }
    
    if (!formData.collateralAmount || parseFloat(formData.collateralAmount) <= 0) {
      newErrors.collateralAmount = 'Please enter a valid collateral amount';
    }
    
    if (formData.borrowAsset === formData.collateralAsset) {
      newErrors.collateralAsset = 'Collateral asset must be different from borrow asset';
    }
    
    // Check if collateral is sufficient
    if (collateralInfo && collateralInfo.ltv > 1) {
      newErrors.collateralAmount = 'Insufficient collateral for the requested loan amount';
    }
    
    // Check if user has enough collateral balance
    const collateralAsset = SUPPORTED_ASSETS.find(a => a.symbol === formData.collateralAsset);
    if (collateralAsset && parseFloat(formData.collateralAmount) > parseFloat(collateralAsset.balance)) {
      newErrors.collateralAmount = 'Insufficient collateral balance';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to continue',
        variant: 'destructive',
      });
      return;
    }
    
    if (!validateForm()) return;
    
    // Prepare transaction details for confirmation
    const borrowAsset = SUPPORTED_ASSETS.find(a => a.symbol === formData.borrowAsset)!;
    const collateralAsset = SUPPORTED_ASSETS.find(a => a.symbol === formData.collateralAsset)!;
    
    const transaction: TransactionDetails = {
      type: 'borrowing',
      asset: formData.borrowAsset,
      amount: formData.borrowAmount,
      interestRate: formData.interestRate,
      duration: formData.duration,
      collateralAsset: formData.collateralAsset,
      collateralAmount: formData.collateralAmount,
      estimatedFees: {
        networkFee: '0.00001',
        protocolFee: (parseFloat(formData.borrowAmount) * 0.001).toFixed(6),
        total: '0.00101',
      },
      risks: [
        'Collateral may be liquidated if LTV exceeds threshold',
        'Interest rates may fluctuate based on market conditions',
        'Smart contract risks apply to all DeFi transactions',
        `Current LTV: ${((collateralInfo?.ltv || 0) * 100).toFixed(1)}%`,
        `Liquidation threshold: ${((collateralInfo?.liquidationThreshold || 0) * 100).toFixed(1)}%`,
      ],
      deadline: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    };
    
    setTransactionDetails(transaction);
    setShowConfirmation(true);
  };

  const handleConfirmTransaction = async () => {
    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Mock transaction submission
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast({
          title: 'Borrowing Successful',
          description: `Successfully borrowed ${formData.borrowAmount} ${formData.borrowAsset}`,
          variant: 'success',
        });
        
        // Reset form
        setFormData({
          borrowAsset: '',
          borrowAmount: '',
          collateralAsset: '',
          collateralAmount: '',
          duration: 30,
          interestRate: 0,
        });
        setCollateralInfo(null);
      }
    } catch (error) {
      console.error('Borrowing failed:', error);
      toast({
        title: 'Borrowing Failed',
        description: error instanceof Error ? error.message : 'Failed to process borrowing request',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskLevel = (): 'low' | 'medium' | 'high' => {
    if (!collateralInfo) return 'low';
    
    const ltvPercentage = collateralInfo.ltv * 100;
    const liquidationPercentage = collateralInfo.liquidationThreshold * 100;
    
    if (ltvPercentage > liquidationPercentage * 0.9) return 'high';
    if (ltvPercentage > liquidationPercentage * 0.7) return 'medium';
    return 'low';
  };

  const riskLevel = getRiskLevel();
  const riskColors = {
    low: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <>
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📈 Borrow Assets
            <span className="text-sm font-normal text-muted-foreground">
              Use your assets as collateral to borrow
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Borrow Asset Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Asset to Borrow</label>
              <AssetSelector
                assets={SUPPORTED_ASSETS}
                selectedAsset={formData.borrowAsset}
                amount={formData.borrowAmount}
                onAssetChange={(asset) => setFormData(prev => ({ ...prev, borrowAsset: asset }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, borrowAmount: amount }))}
                placeholder="Select asset to borrow"
                showBalance={false}
              />
              {errors.borrowAsset && (
                <p className="text-sm text-red-600">{errors.borrowAsset}</p>
              )}
              {errors.borrowAmount && (
                <p className="text-sm text-red-600">{errors.borrowAmount}</p>
              )}
            </div>

            {/* Collateral Asset Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Collateral Asset</label>
              <AssetSelector
                assets={SUPPORTED_ASSETS.filter(a => a.symbol !== formData.borrowAsset)}
                selectedAsset={formData.collateralAsset}
                amount={formData.collateralAmount}
                onAssetChange={(asset) => setFormData(prev => ({ ...prev, collateralAsset: asset }))}
                onAmountChange={(amount) => setFormData(prev => ({ ...prev, collateralAmount: amount }))}
                placeholder="Select collateral asset"
                showBalance={true}
              />
              {errors.collateralAsset && (
                <p className="text-sm text-red-600">{errors.collateralAsset}</p>
              )}
              {errors.collateralAmount && (
                <p className="text-sm text-red-600">{errors.collateralAmount}</p>
              )}
            </div>

            {/* Loan Duration */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Loan Duration (Days)</label>
              <div className="flex gap-2">
                {[7, 14, 30, 60, 90].map((days) => (
                  <Button
                    key={days}
                    type="button"
                    variant={formData.duration === days ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, duration: days }))}
                  >
                    {days}d
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                min="1"
                max="365"
                className="w-32"
              />
            </div>

            {/* Interest Rate Display */}
            {formData.borrowAsset && (
              <InterestRateDisplay
                assets={SUPPORTED_ASSETS.filter(a => a.symbol === formData.borrowAsset)}
                view="compact"
              />
            )}

            {/* Collateral Information */}
            {collateralInfo && (
              <Card className={cn('border', riskColors[riskLevel])}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Collateral Analysis</span>
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium capitalize',
                        riskColors[riskLevel]
                      )}>
                        {riskLevel} Risk
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Required Collateral:</span>
                        <div className="font-semibold">
                          {collateralInfo.amount} {collateralInfo.asset}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Current LTV:</span>
                        <div className={cn(
                          'font-semibold',
                          riskLevel === 'high' ? 'text-red-600' :
                          riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        )}>
                          {(collateralInfo.ltv * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Liquidation Threshold:</span>
                        <div className="font-semibold">
                          {(collateralInfo.liquidationThreshold * 100).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Collateral Value:</span>
                        <div className="font-semibold">
                          ${collateralInfo.value.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    {riskLevel === 'high' && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        ⚠️ High liquidation risk! Consider adding more collateral.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isConnected}
              size="lg"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing...
                </>
              ) : (
                'Borrow Assets'
              )}
            </Button>
            
            {!isConnected && (
              <p className="text-sm text-muted-foreground text-center">
                Connect your wallet to start borrowing
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Transaction Confirmation Modal */}
      <TransactionConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmTransaction}
        transaction={transactionDetails}
      />
    </>
  );
}