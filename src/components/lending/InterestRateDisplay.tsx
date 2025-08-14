import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';

interface InterestRate {
  asset: string;
  lendingAPY: number;
  borrowingAPR: number;
  utilization: number;
  totalSupply: string;
  totalBorrowed: string;
  availableLiquidity: string;
  lastUpdated: Date;
}

interface InterestRateDisplayProps {
  rates: InterestRate[];
  selectedAsset?: string;
  onAssetSelect?: (asset: string) => void;
  showDetails?: boolean;
  className?: string;
}

const MOCK_RATES: InterestRate[] = [
  {
    asset: 'XRP',
    lendingAPY: 6.8,
    borrowingAPR: 8.2,
    utilization: 75.5,
    totalSupply: '1,250,000',
    totalBorrowed: '943,750',
    availableLiquidity: '306,250',
    lastUpdated: new Date(),
  },
  {
    asset: 'RLUSD',
    lendingAPY: 8.2,
    borrowingAPR: 10.5,
    utilization: 82.3,
    totalSupply: '500,000',
    totalBorrowed: '411,500',
    availableLiquidity: '88,500',
    lastUpdated: new Date(),
  },
];

export function InterestRateDisplay({
  rates = MOCK_RATES,
  selectedAsset,
  onAssetSelect,
  showDetails = false,
  className,
}: InterestRateDisplayProps) {
  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 80) return 'text-orange-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUtilizationBgColor = (utilization: number) => {
    if (utilization >= 90) return 'bg-red-100';
    if (utilization >= 80) return 'bg-orange-100';
    if (utilization >= 70) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!showDetails) {
    // Compact view - just show rates in a grid
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {rates.map((rate) => (
          <Card
            key={rate.asset}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedAsset === rate.asset ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50',
              onAssetSelect ? 'cursor-pointer' : 'cursor-default'
            )}
            onClick={() => onAssetSelect?.(rate.asset)}
          >
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <div className="font-semibold text-lg">{rate.asset}</div>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Lend:</span>
                    <span className="ml-1 font-medium text-green-600">{rate.lendingAPY}%</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Borrow:</span>
                    <span className="ml-1 font-medium text-red-600">{rate.borrowingAPR}%</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {rate.utilization}% utilized
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Detailed view - show full table
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Interest Rates & Market Data</CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time lending and borrowing rates across all supported assets
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3">Asset</th>
                <th className="text-right py-2 px-3">Lending APY</th>
                <th className="text-right py-2 px-3">Borrowing APR</th>
                <th className="text-right py-2 px-3">Utilization</th>
                <th className="text-right py-2 px-3">Total Supply</th>
                <th className="text-right py-2 px-3">Available</th>
                <th className="text-right py-2 px-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => (
                <tr
                  key={rate.asset}
                  className={cn(
                    'border-b hover:bg-gray-50 transition-colors',
                    selectedAsset === rate.asset ? 'bg-blue-50' : '',
                    onAssetSelect ? 'cursor-pointer' : ''
                  )}
                  onClick={() => onAssetSelect?.(rate.asset)}
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {rate.asset?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium">{rate.asset}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-3">
                    <span className="font-medium text-green-600">
                      {rate.lendingAPY.toFixed(2)}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-3">
                    <span className="font-medium text-red-600">
                      {rate.borrowingAPR.toFixed(2)}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-3">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            getUtilizationBgColor(rate.utilization)
                          )}
                          style={{ width: `${Math.min(rate.utilization, 100)}%` }}
                        />
                      </div>
                      <span className={cn('text-sm font-medium', getUtilizationColor(rate.utilization))}>
                        {rate.utilization.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-3">
                    <div className="text-sm">
                      <div className="font-medium">{rate.totalSupply}</div>
                      <div className="text-xs text-muted-foreground">
                        Borrowed: {rate.totalBorrowed}
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-3 px-3">
                    <span className="font-medium">{rate.availableLiquidity}</span>
                  </td>
                  <td className="text-right py-3 px-3">
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(rate.lastUpdated)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <span>Low utilization (&lt;70%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-100 rounded"></div>
              <span>Medium utilization (70-80%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-orange-100 rounded"></div>
              <span>High utilization (80-90%)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-100 rounded"></div>
              <span>Very high utilization (&gt;90%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}