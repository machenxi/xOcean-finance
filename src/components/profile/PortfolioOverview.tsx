import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { PortfolioMetrics } from '@/types/profile';
import { cn } from '@/lib/utils';

interface PortfolioOverviewProps {
  metrics: PortfolioMetrics | null;
  isLoading?: boolean;
}

export function PortfolioOverview({ metrics, isLoading = false }: PortfolioOverviewProps) {
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <Card className="mb-6">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No portfolio data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Portfolio Value</div>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.totalValue)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total assets under management
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Net Profit</div>
            <div className={cn(
              'text-2xl font-bold',
              parseFloat(metrics.netProfit) >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {formatCurrency(metrics.netProfit)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ROI: {formatPercentage(metrics.roi)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Health Score</div>
            <div className={cn(
              'text-2xl font-bold',
              getHealthScoreColor(metrics.healthScore)
            )}>
              {metrics.healthScore}/100
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Account stability rating
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Risk Level</div>
            <Badge className={getRiskBadgeColor(metrics.liquidationRisk)}>
              {metrics.liquidationRisk.toUpperCase()}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">
              Liquidation risk assessment
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Earnings Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Earned</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(metrics.totalEarned)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-semibold text-red-600">
                {formatCurrency(metrics.totalPaid)}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Net Profit</span>
                <span className={cn(
                  'font-bold text-lg',
                  parseFloat(metrics.netProfit) >= 0 ? 'text-green-600' : 'text-red-600'
                )}>
                  {formatCurrency(metrics.netProfit)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Health Score</span>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-3 h-3 rounded-full',
                  metrics.healthScore >= 80 ? 'bg-green-500' :
                  metrics.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                )}></div>
                <span className="font-semibold">
                  {metrics.healthScore}/100
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Liquidation Risk</span>
              <Badge className={getRiskBadgeColor(metrics.liquidationRisk)}>
                {metrics.liquidationRisk.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Return on Investment</span>
              <span className={cn(
                'font-semibold',
                metrics.roi >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                {formatPercentage(metrics.roi)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📈</div>
              <p>Performance chart will be implemented here</p>
              <p className="text-sm">Integration with charting library pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}