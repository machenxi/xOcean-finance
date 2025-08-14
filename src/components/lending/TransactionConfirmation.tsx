import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading';
import { Card, CardContent } from '../ui/card';
import { useToast } from '@/hooks/useToast';
import { useWallet } from '@/context/WalletProvider';
import { cn } from '@/lib/utils';

export interface TransactionDetails {
  type: 'lending' | 'borrowing' | 'withdrawal' | 'repayment' | 'liquidation';
  asset: string;
  amount: string;
  interestRate?: number;
  duration?: number;
  collateralAsset?: string;
  collateralAmount?: string;
  recipient?: string;
  estimatedFees: {
    networkFee: string;
    protocolFee?: string;
    total: string;
  };
  estimatedReturn?: string;
  risks?: string[];
  deadline?: Date;
}

interface TransactionConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  transaction: TransactionDetails | null;
  title?: string;
  description?: string;
}

export function TransactionConfirmation({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  title,
  description,
}: TransactionConfirmationProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();
  const { address, balance } = useWallet();

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsConfirming(false);
      setCountdown(10); // 10 second countdown for safety
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0 && isOpen) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isOpen]);

  if (!transaction) return null;

  const getTransactionTitle = () => {
    if (title) return title;
    
    switch (transaction.type) {
      case 'lending': return 'Confirm Lending Transaction';
      case 'borrowing': return 'Confirm Borrowing Transaction';
      case 'withdrawal': return 'Confirm Withdrawal';
      case 'repayment': return 'Confirm Repayment';
      case 'liquidation': return 'Confirm Liquidation';
      default: return 'Confirm Transaction';
    }
  };

  const getTransactionDescription = () => {
    if (description) return description;
    
    switch (transaction.type) {
      case 'lending':
        return `You are about to lend ${transaction.amount} ${transaction.asset} for ${transaction.duration} days at ${transaction.interestRate}% APY.`;
      case 'borrowing':
        return `You are about to borrow ${transaction.amount} ${transaction.asset} using ${transaction.collateralAmount} ${transaction.collateralAsset} as collateral.`;
      case 'withdrawal':
        return `You are about to withdraw ${transaction.amount} ${transaction.asset} from your lending position.`;
      case 'repayment':
        return `You are about to repay ${transaction.amount} ${transaction.asset} to close your borrowing position.`;
      case 'liquidation':
        return `You are about to liquidate a position to recover ${transaction.amount} ${transaction.asset}.`;
      default:
        return 'Please review the transaction details carefully before confirming.';
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Transaction confirmation failed:', error);
      toast({
        title: 'Transaction Failed',
        description: error instanceof Error ? error.message : 'Transaction failed to complete',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const hasInsufficientBalance = () => {
    if (!balance || transaction.asset !== 'XRP') return false;
    const requiredAmount = parseFloat(transaction.amount) + parseFloat(transaction.estimatedFees.total);
    return parseFloat(balance) < requiredAmount;
  };

  const isExpired = () => {
    if (!transaction.deadline) return false;
    return new Date() > transaction.deadline;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTransactionTitle()}</DialogTitle>
          <DialogDescription>
            {getTransactionDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-semibold">
                  {transaction.amount} {transaction.asset}
                </span>
              </div>
              
              {transaction.interestRate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Interest Rate:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {transaction.interestRate}% APY
                  </span>
                </div>
              )}
              
              {transaction.duration && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="font-semibold">{transaction.duration} days</span>
                </div>
              )}
              
              {transaction.collateralAsset && transaction.collateralAmount && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Collateral:</span>
                  <span className="font-semibold">
                    {transaction.collateralAmount} {transaction.collateralAsset}
                  </span>
                </div>
              )}
              
              {transaction.estimatedReturn && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Expected Return:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {transaction.estimatedReturn} {transaction.asset}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fees Breakdown */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="text-sm font-medium mb-2">Transaction Fees</div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Network Fee:</span>
                <span>{transaction.estimatedFees.networkFee} XRP</span>
              </div>
              
              {transaction.estimatedFees.protocolFee && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Protocol Fee:</span>
                  <span>{transaction.estimatedFees.protocolFee} {transaction.asset}</span>
                </div>
              )}
              
              <hr className="my-2" />
              
              <div className="flex justify-between items-center font-semibold">
                <span>Total Fees:</span>
                <span>{transaction.estimatedFees.total} XRP</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="text-sm font-medium mb-2">Account Details</div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">From:</span>
                <span className="font-mono text-xs">
                  {address?.slice(0, 8)}...{address?.slice(-6)}
                </span>
              </div>
              
              {transaction.recipient && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-mono text-xs">
                    {transaction.recipient.slice(0, 8)}...{transaction.recipient.slice(-6)}
                  </span>
                </div>
              )}
              
              {balance && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Current Balance:</span>
                  <span className={cn(
                    hasInsufficientBalance() ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  )}>
                    {balance} XRP
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Risks and Warnings */}
          {(transaction.risks?.length || hasInsufficientBalance() || isExpired()) && (
            <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Important Notices</div>
                
                {hasInsufficientBalance() && (
                  <div className="text-sm text-red-600 mb-2">
                    Insufficient balance to complete this transaction.
                  </div>
                )}
                
                {isExpired() && (
                  <div className="text-sm text-red-600 mb-2">
                    This transaction offer has expired.
                  </div>
                )}
                
                {transaction.risks?.map((risk, index) => (
                  <div key={index} className="text-sm text-yellow-700 mb-1">
                    • {risk}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Countdown Timer */}
          {countdown > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Please wait {countdown} seconds before confirming...
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleConfirm}
            disabled={
              isConfirming || 
              countdown > 0 || 
              hasInsufficientBalance() || 
              isExpired()
            }
            className="min-w-[120px]"
          >
            {isConfirming ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Confirming...
              </>
            ) : (
              'Confirm Transaction'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}