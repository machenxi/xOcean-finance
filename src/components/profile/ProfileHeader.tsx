import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { UserProfile } from '@/types/profile';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  address: string;
  network: string;
  onRefresh: () => void;
  onExport: () => void;
  isLoading?: boolean;
}

export function ProfileHeader({
  profile,
  address,
  network,
  onRefresh,
  onExport,
  isLoading = false,
}: ProfileHeaderProps) {
  const getVerificationBadgeColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage 
                src={profile?.avatar} 
                alt={`${address} avatar`} 
              />
              <AvatarFallback className="text-lg font-semibold">
                {address.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl">
                  {profile?.displayName || formatAddress(address)}
                </CardTitle>
                <Badge 
                  className={cn(
                    'capitalize',
                    getVerificationBadgeColor(profile?.verificationStatus || 'unverified')
                  )}
                >
                  {profile?.verificationStatus || 'unverified'}
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>Address: {formatAddress(address)}</span>
                <Badge variant="outline" className="capitalize">
                  {network}
                </Badge>
                {profile?.joinDate && (
                  <span>
                    Member since {new Date(profile.joinDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport}
              disabled={isLoading}
            >
              📊 Export Data
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '🔄'} Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {profile && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Transactions</span>
              <span className="font-medium">{profile.totalTransactions}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Health</span>
              <span className={cn(
                'font-medium',
                profile.accountHealthScore >= 80 ? 'text-green-600' :
                profile.accountHealthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              )}>
                {profile.accountHealthScore}/100
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Level</span>
              <Badge 
                variant="outline" 
                className={cn(
                  profile.accountHealthScore >= 80 ? 'border-green-200 text-green-700' :
                  profile.accountHealthScore >= 60 ? 'border-yellow-200 text-yellow-700' : 
                  'border-red-200 text-red-700'
                )}
              >
                {profile.accountHealthScore >= 80 ? 'LOW' :
                 profile.accountHealthScore >= 60 ? 'MEDIUM' : 'HIGH'}
              </Badge>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}