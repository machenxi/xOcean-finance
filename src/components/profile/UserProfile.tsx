import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from '../ui/loading';
import { useWallet } from '@/context/WalletProvider';
import { useToast } from '@/hooks/useToast';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

// Import profile components
import { ProfileHeader } from './ProfileHeader';
import { PortfolioOverview } from './PortfolioOverview';
// import { PositionManager } from './PositionManager';
// import { TransactionHistory } from './TransactionHistory';
// import { RiskDashboard } from './RiskDashboard';
// import { EarningsAnalytics } from './EarningsAnalytics';
// import { AccountSettings } from './AccountSettings';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className }: UserProfileProps) {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { connected, address, network } = useWallet();
  const { toast } = useToast();
  
  const {
    profile,
    metrics,
    positions,
    transactions,
    analytics,
    isLoading,
    error,
    refreshProfile,
    exportData,
  } = useProfile();

  // Handle data export
  const handleExportData = async () => {
    toast({
      title: 'Export Started',
      description: 'Your data export is being prepared...',
      variant: 'default',
    });
    
    try {
      const downloadUrl = await exportData({
        format: 'csv',
        dateRange: {
          start: new Date(Date.now() - 86400000 * 90), // 90 days ago
          end: new Date(),
        },
        includeTransactions: true,
        includePositions: true,
        includeAnalytics: true,
        includePersonalData: false,
      });
      
      if (downloadUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `xocean-profile-${address?.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Export Complete',
          description: 'Your data has been exported successfully.',
          variant: 'default',
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (err) {
      toast({
        title: 'Export Failed',
        description: 'Unable to export your data. Please try again.',
        variant: 'destructive',
      });
    }
  };



  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Redirect to connect wallet if not connected
  if (!connected) {
    return (
      <div className={cn('w-full max-w-4xl mx-auto p-6', className)}>
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              Please connect your wallet to view your profile and portfolio information.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('w-full max-w-6xl mx-auto p-6', className)}>
        <div className="text-center py-12">
          <LoadingSpinner className="mx-auto mb-4" size="lg" />
          <h2 className="text-xl font-semibold mb-2">Loading Your Profile</h2>
          <p className="text-muted-foreground">Fetching your portfolio data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('w-full max-w-4xl mx-auto p-6', className)}>
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Error Loading Profile</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={refreshProfile}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-6xl mx-auto p-6', className)}>
      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        address={address || ''}
        network={network || 'unknown'}
        onRefresh={refreshProfile}
        onExport={handleExportData}
        isLoading={isLoading}
      />



      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="positions">💼 Positions</TabsTrigger>
          <TabsTrigger value="transactions">📋 History</TabsTrigger>
          <TabsTrigger value="risk">⚠️ Risk</TabsTrigger>
          <TabsTrigger value="analytics">📈 Analytics</TabsTrigger>
          <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <PortfolioOverview 
             metrics={metrics} 
             isLoading={isLoading} 
           />
        </TabsContent>

        <TabsContent value="positions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Position Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">💼</div>
                <div>Position management interface will be implemented here</div>
                <div className="text-sm mt-2">Active positions, history, and analytics</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📋</div>
                <div>Transaction history will be implemented here</div>
                <div className="text-sm mt-2">Comprehensive transaction log with filtering</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">⚠️</div>
                <div>Risk dashboard will be implemented here</div>
                <div className="text-sm mt-2">Collateral tracking and liquidation alerts</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">📈</div>
                <div>Analytics dashboard will be implemented here</div>
                <div className="text-sm mt-2">Performance charts and insights</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">⚙️</div>
                <div>Settings interface will be implemented here</div>
                <div className="text-sm mt-2">Preferences, notifications, and privacy controls</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}