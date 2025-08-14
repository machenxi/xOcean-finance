import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '@/lib/utils';

export interface Asset {
  code: string;
  name: string;
  icon?: string;
  balance?: string;
  price?: number;
  apy?: number;
  minAmount?: string;
  maxAmount?: string;
  issuer?: string;
  trustlineRequired?: boolean;
}

interface AssetSelectorProps {
  assets: Asset[];
  selectedAsset?: Asset;
  onAssetSelect: (asset: Asset) => void;
  amount?: string;
  onAmountChange?: (amount: string) => void;
  showBalance?: boolean;
  showAPY?: boolean;
  mode?: 'lending' | 'borrowing' | 'collateral';
  className?: string;
}

const DEFAULT_ASSETS: Asset[] = [
  {
    code: 'XRP',
    name: 'XRP',
    balance: '1,250.000000',
    price: 0.52,
    apy: 6.8,
    minAmount: '10',
    maxAmount: '100000',
  },
  {
    code: 'RLUSD',
    name: 'RLUSD Stablecoin',
    balance: '500.00',
    price: 1.0,
    apy: 8.2,
    minAmount: '1',
    maxAmount: '50000',
    issuer: 'rRLUSDIssuerAddress',
    trustlineRequired: true,
  },
];

export function AssetSelector({
  assets = DEFAULT_ASSETS,
  selectedAsset,
  onAssetSelect,
  amount,
  onAmountChange,
  showBalance = true,
  showAPY = true,
  mode = 'lending',
  className,
}: AssetSelectorProps) {
  const [showAllAssets, setShowAllAssets] = useState(false);

  const availableAssets = showAllAssets 
    ? assets 
    : assets.filter(asset => parseFloat(asset.balance || '0') > 0);

  const handleAssetSelect = (assetKey: string) => {
    const asset = assets.find(a => `${a.code}-${a.issuer || 'native'}` === assetKey);
    if (asset) {
      onAssetSelect(asset);
    }
  };

  const getSelectedAssetKey = () => {
    if (!selectedAsset) return undefined;
    return `${selectedAsset.code}-${selectedAsset.issuer || 'native'}`;
  };

  const getAssetDisplayName = (asset: Asset) => {
    return `${asset.code} - ${asset.name}`;
  };

  const handleMaxClick = () => {
    if (selectedAsset?.balance && onAmountChange) {
      // Leave some buffer for transaction fees if it's XRP
      const maxAmount = selectedAsset.code === 'XRP' 
        ? Math.max(0, parseFloat(selectedAsset.balance.replace(/,/g, '')) - 10).toString()
        : selectedAsset.balance.replace(/,/g, '');
      onAmountChange(maxAmount);
    }
  };

  const getAPYLabel = () => {
    switch (mode) {
      case 'lending': return 'Lending APY';
      case 'borrowing': return 'Borrow APR';
      case 'collateral': return 'Collateral APY';
      default: return 'APY';
    }
  };

  const getAmountLabel = () => {
    switch (mode) {
      case 'lending': return 'Amount to Lend';
      case 'borrowing': return 'Amount to Borrow';
      case 'collateral': return 'Collateral Amount';
      default: return 'Amount';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Asset Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Asset</label>
        
        <Select
          value={getSelectedAssetKey()}
          onValueChange={handleAssetSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose an asset...">
              {selectedAsset && (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {selectedAsset.code?.charAt(0) || '?'}
                  </div>
                  <span className="font-medium">{selectedAsset.code}</span>
                  <span className="text-muted-foreground">- {selectedAsset.name}</span>
                  {showBalance && (
                    <span className="ml-auto text-sm">{selectedAsset.balance || '0.00'}</span>
                  )}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {availableAssets.map((asset) => (
              <SelectItem
                key={`${asset.code}-${asset.issuer || 'native'}`}
                value={`${asset.code}-${asset.issuer || 'native'}`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {asset.code?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-medium">{asset.code}</div>
                      <div className="text-xs text-muted-foreground">{asset.name}</div>
                      {asset.trustlineRequired && (
                        <div className="text-xs text-orange-600">Trustline required</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {showBalance && (
                      <div className="text-sm font-medium">
                        {asset.balance || '0.00'}
                      </div>
                    )}
                    {showAPY && asset.apy && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {asset.apy}% {getAPYLabel().split(' ')[1]}
                      </div>
                    )}
                    {asset.price && (
                      <div className="text-xs text-muted-foreground">
                        ${asset.price.toFixed(asset.price < 1 ? 6 : 2)}
                      </div>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
            {!showAllAssets && assets.length > availableAssets.length && (
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllAssets(true)}
                  className="w-full"
                >
                  Show all assets ({assets.length - availableAssets.length} more)
                </Button>
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Amount Input */}
      {selectedAsset && onAmountChange && (
        <div className="space-y-2">
          <label className="text-sm font-medium">{getAmountLabel()}</label>
          <div className="relative">
            <Input
              type="number"
              placeholder={`Min: ${selectedAsset.minAmount || '0'}`}
              value={amount || ''}
              onChange={(e) => onAmountChange(e.target.value)}
              min={selectedAsset.minAmount || '0'}
              max={selectedAsset.maxAmount}
              step="0.000001"
              className="pr-16"
            />
            {showBalance && selectedAsset.balance && parseFloat(selectedAsset.balance.replace(/,/g, '')) > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMaxClick}
                className="absolute right-1 top-1 h-8 px-2 text-xs"
              >
                MAX
              </Button>
            )}
          </div>
          
          {/* Amount Validation */}
          {amount && selectedAsset && (
            <div className="text-xs space-y-1">
              {parseFloat(amount) < parseFloat(selectedAsset.minAmount || '0') && (
                <div className="text-red-600 dark:text-red-400">
                  Minimum amount: {selectedAsset.minAmount} {selectedAsset.code}
                </div>
              )}
              {selectedAsset.maxAmount && parseFloat(amount) > parseFloat(selectedAsset.maxAmount) && (
                <div className="text-red-600 dark:text-red-400">
                  Maximum amount: {selectedAsset.maxAmount} {selectedAsset.code}
                </div>
              )}
              {showBalance && selectedAsset.balance && parseFloat(amount) > parseFloat(selectedAsset.balance.replace(/,/g, '')) && (
                <div className="text-red-600 dark:text-red-400">
                  Insufficient balance. Available: {selectedAsset.balance} {selectedAsset.code}
                </div>
              )}
              {amount && selectedAsset.price && (
                <div className="text-muted-foreground">
                  ≈ ${(parseFloat(amount) * selectedAsset.price).toFixed(2)} RLUSD
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Asset Summary */}
      {selectedAsset && (
        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Selected Asset:</span>
                <span className="font-medium">{selectedAsset.code}</span>
              </div>
              {showAPY && selectedAsset.apy && (
                <div className="flex justify-between">
                  <span>{getAPYLabel()}:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">{selectedAsset.apy}%</span>
                </div>
              )}
              {showBalance && selectedAsset.balance && (
                <div className="flex justify-between">
                  <span>Available Balance:</span>
                  <span className="font-medium">{selectedAsset.balance}</span>
                </div>
              )}
              {selectedAsset.trustlineRequired && (
                <div className="text-xs text-orange-600 mt-2">
                  ⚠️ This asset requires a trustline to be established first
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}