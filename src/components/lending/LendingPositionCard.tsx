import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';

export interface LendingPosition {
  id: string;
  asset: string;
  amount: string;
  originalAmount: string;
  interestRate: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'withdrawn' | 'defaulted';
  accruedInterest: string;
  totalReturn: string;
  borrower?: string;
  escrowAddress?: string;
  transactionHash?: string;
}

interface LendingPositionCardProps {
  position: LendingPosition;
  onWithdraw?: (positionId: string) => Promise<void>;
  onExtend?: (positionId: string, newEndDate: Date) => Promise<void>;
  className?: string;
}

export function LendingPositionCard({
  position,
  onWithdraw,
  onExtend,
  className,
}: LendingPositionCardProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'completed': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'withdrawn': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
      case 'defaulted': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getStatusText = (status: LendingPosition['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'completed': return 'Completed';
      case 'withdrawn': return 'Withdrawn';
      case 'defaulted': return 'Defaulted';
      default: return 'Unknown';
    }
  };

  const calculateProgress = () => {
    const now = new Date();
    const start = position.startDate;
    const end = position.endDate;
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const end = position.endDate;
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 0);
  };

  const isMatured = () => {
    return new Date() >= position.endDate;
  };

  const canWithdraw = () => {
    return position.status === 'active' && (isMatured() || position.status === 'completed');
  };

  const canExtend = () => {
    return position.status === 'active' && !isMatured();
  };

  const handleWithdraw = async () => {
    if (!onWithdraw) return;
    
    setIsWithdrawing(true);
    try {
      await onWithdraw(position.id);
      toast({
        title: 'Withdrawal Successful',
        description: `Successfully withdrew ${position.totalReturn} ${position.asset}`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Withdrawal failed:', error);
      toast({
        title: 'Withdrawal Failed',
        description: error instanceof Error ? error.message : 'Failed to withdraw funds',
        variant: 'destructive',
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleExtend = async () => {
    if (!onExtend) return;
    
    // For now, extend by 30 days
    const newEndDate = new Date(position.endDate);
    newEndDate.setDate(newEndDate.getDate() + 30);
    
    setIsExtending(true);
    try {
      await onExtend(position.id, newEndDate);
      toast({
        title: 'Position Extended',
        description: `Successfully extended lending position by 30 days`,
        variant: 'success',
      });
    } catch (error) {
      console.error('Extension failed:', error);
      toast({
        title: 'Extension Failed',
        description: error instanceof Error ? error.message : 'Failed to extend position',
        variant: 'destructive',
      });
    } finally {
      setIsExtending(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const progress = calculateProgress();
  const daysRemaining = getDaysRemaining();

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {position.asset} Lending Position
          </CardTitle>
          <div className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            getStatusColor(position.status)
          )}>
            {getStatusText(position.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Amount and Returns */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Principal Amount</div>
            <div className="text-lg font-semibold">
              {position.originalAmount} {position.asset}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Current Value</div>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {position.totalReturn} {position.asset}
            </div>
          </div>
        </div>

        {/* Interest Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Interest Rate</div>
            <div className="font-medium">{position.interestRate}% APY</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Accrued Interest</div>
            <div className="font-medium text-green-600 dark:text-green-400">
              +{position.accruedInterest} {position.asset}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Matured'}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all',
                progress >= 100 ? 'bg-green-500 dark:bg-green-400' : 'bg-blue-500 dark:bg-blue-400'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Started: {formatDate(position.startDate)}</span>
            <span>Ends: {formatDate(position.endDate)}</span>
          </div>
        </div>

        {/* Additional Details */}
        <div className="pt-2 border-t space-y-2">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {position.borrower && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Borrower:</span>
                <span className="font-mono text-xs">
                  {position.borrower.slice(0, 8)}...{position.borrower.slice(-6)}
                </span>
              </div>
            )}
            {position.escrowAddress && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Escrow:</span>
                <span className="font-mono text-xs">
                  {position.escrowAddress.slice(0, 8)}...{position.escrowAddress.slice(-6)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Position ID:</span>
              <span className="font-mono text-xs">{position.id}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(canWithdraw() || canExtend()) && (
          <div className="flex gap-2 pt-2">
            {canWithdraw() && (
              <Button
                onClick={handleWithdraw}
                disabled={isWithdrawing}
                className="flex-1"
                variant={isMatured() ? 'default' : 'outline'}
              >
                {isWithdrawing ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Withdrawing...
                  </>
                ) : (
                  `Withdraw ${position.totalReturn} ${position.asset}`
                )}
              </Button>
            )}
            
            {canExtend() && (
              <Button
                onClick={handleExtend}
                disabled={isExtending}
                variant="outline"
                className="flex-1"
              >
                {isExtending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Extending...
                  </>
                ) : (
                  'Extend +30d'
                )}
              </Button>
            )}
          </div>
        )}

        {/* Maturity Notice */}
        {isMatured() && position.status === 'active' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="text-sm text-green-800">
              🎉 Your lending position has matured! You can now withdraw your funds with earned interest.
            </div>
          </div>
        )}

        {/* Warning for near maturity */}
        {!isMatured() && daysRemaining <= 7 && position.status === 'active' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="text-sm text-yellow-800">
              ⚠️ Your lending position will mature in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. Consider extending if you want to continue earning interest.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}