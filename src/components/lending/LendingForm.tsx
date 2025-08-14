import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { LoadingSpinner } from '../ui/loading';
import { useToast } from '@/hooks/useToast';
import { useXRPL } from '@/hooks/useXRPL';
import { useWallet } from '@/context/WalletProvider';

interface LendingFormProps {
  onSuccess?: () => void;
}

interface LendingFormData {
  amount: string;
  currency: string;
  duration: string;
  interestRate: string;
}

const SUPPORTED_CURRENCIES = [
  { code: 'XRP', name: 'XRP', minAmount: '10' },
  { code: 'RLUSD', name: 'RLUSD (Stablecoin)', minAmount: '1' },
];

const DURATION_OPTIONS = [
  { value: '7', label: '7 Days', rate: '5.2' },
  { value: '30', label: '30 Days', rate: '6.8' },
  { value: '90', label: '90 Days', rate: '8.5' },
  { value: '180', label: '180 Days', rate: '10.2' },
];

export function LendingForm({ onSuccess }: LendingFormProps) {
  const [formData, setFormData] = useState<LendingFormData>({
    amount: '',
    currency: 'XRP',
    duration: '30',
    interestRate: '6.8',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { isConnected, address } = useWallet();
  const { submitTransaction } = useXRPL();

  const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === formData.currency);
  const selectedDuration = DURATION_OPTIONS.find(d => d.value === formData.duration);

  const handleInputChange = (field: keyof LendingFormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Update interest rate when duration changes
      if (field === 'duration') {
        const duration = DURATION_OPTIONS.find(d => d.value === value);
        if (duration) {
          updated.interestRate = duration.rate;
        }
      }
      
      return updated;
    });
  };

  const calculateExpectedReturn = () => {
    const principal = parseFloat(formData.amount) || 0;
    const rate = parseFloat(formData.interestRate) || 0;
    const days = parseInt(formData.duration) || 0;
    
    const interest = (principal * rate * days) / (365 * 100);
    return principal + interest;
  };

  const validateForm = (): string | null => {
    if (!isConnected) return 'Please connect your wallet first';
    if (!formData.amount || parseFloat(formData.amount) <= 0) return 'Please enter a valid amount';
    if (!selectedCurrency) return 'Please select a currency';
    if (parseFloat(formData.amount) < parseFloat(selectedCurrency.minAmount)) {
      return `Minimum amount is ${selectedCurrency.minAmount} ${selectedCurrency.code}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual lending transaction
      const txData = {
        TransactionType: 'EscrowCreate',
        Account: address,
        Destination: 'rLendingPoolAddress', // This will be the lending pool address
        Amount: (parseFloat(formData.amount) * 1000000).toString(), // Convert to drops for XRP
        FinishAfter: Math.floor(Date.now() / 1000) + (parseInt(formData.duration) * 24 * 60 * 60),
        Condition: 'A0258020E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855', // Placeholder condition
      };

      await submitTransaction(txData);
      
      toast({
        title: 'Lending Order Created',
        description: `Successfully created lending order for ${formData.amount} ${formData.currency}`,
        variant: 'success',
      });
      
      // Reset form
      setFormData({
        amount: '',
        currency: 'XRP',
        duration: '30',
        interestRate: '6.8',
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Lending transaction failed:', error);
      toast({
        title: 'Transaction Failed',
        description: error instanceof Error ? error.message : 'Failed to create lending order',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Lend Assets</CardTitle>
        <p className="text-sm text-muted-foreground text-center">
          Earn interest by lending your crypto assets
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Currency Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <Input
              type="number"
              placeholder={`Min: ${selectedCurrency?.minAmount || '0'}`}
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              min={selectedCurrency?.minAmount || '0'}
              step="0.000001"
            />
          </div>

          {/* Duration Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lending Duration</label>
            <select
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="w-full p-2 border border-input rounded-md bg-background"
            >
              {DURATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.rate}% APY
                </option>
              ))}
            </select>
          </div>

          {/* Interest Rate Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Interest Rate (APY)</label>
            <div className="p-2 bg-muted rounded-md">
              <span className="text-lg font-semibold text-green-600">
                {formData.interestRate}%
              </span>
            </div>
          </div>

          {/* Expected Return */}
          {formData.amount && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Expected Return</label>
              <div className="p-2 bg-muted rounded-md">
                <div className="flex justify-between text-sm">
                  <span>Principal:</span>
                  <span>{formData.amount} {formData.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Interest:</span>
                  <span className="text-green-600">
                    +{(calculateExpectedReturn() - parseFloat(formData.amount)).toFixed(6)} {formData.currency}
                  </span>
                </div>
                <hr className="my-1" />
                <div className="flex justify-between font-semibold">
                  <span>Total Return:</span>
                  <span>{calculateExpectedReturn().toFixed(6)} {formData.currency}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!isConnected || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Creating Lending Order...
              </>
            ) : (
              'Create Lending Order'
            )}
          </Button>

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              Connect your wallet to start lending
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}