// src/hooks/useProfile.ts

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/context/WalletProvider';
import { profileService } from '@/services/profileService';
import {
  UserProfile,
  PortfolioMetrics,
  Position,
  Transaction,
  AnalyticsData,
  TransactionFilter,
  PositionFilter,
  PaginationOptions,
  ProfileUpdateRequest,
} from '@/types/profile';

interface UseProfileReturn {
  // Data
  profile: UserProfile | null;
  metrics: PortfolioMetrics | null;
  positions: Position[];
  transactions: Transaction[];
  analytics: AnalyticsData | null;
  
  // Loading states
  isLoading: boolean;
  isLoadingPositions: boolean;
  isLoadingTransactions: boolean;
  isLoadingAnalytics: boolean;
  
  // Error states
  error: string | null;
  positionsError: string | null;
  transactionsError: string | null;
  analyticsError: string | null;
  
  // Pagination
  hasMorePositions: boolean;
  hasMoreTransactions: boolean;
  
  // Actions
  refreshProfile: () => Promise<void>;
  loadPositions: (filter?: PositionFilter, pagination?: PaginationOptions) => Promise<void>;
  loadTransactions: (filter?: TransactionFilter, pagination?: PaginationOptions) => Promise<void>;
  loadAnalytics: () => Promise<void>;
  updateProfile: (updates: ProfileUpdateRequest) => Promise<boolean>;
  exportData: (options: any) => Promise<string | null>;
}

export function useProfile(): UseProfileReturn {
  const { connected, address } = useWallet();
  
  // Data state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPositions, setIsLoadingPositions] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [positionsError, setPositionsError] = useState<string | null>(null);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  
  // Pagination states
  const [hasMorePositions, setHasMorePositions] = useState(false);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(false);

  // Load complete profile data
  const refreshProfile = useCallback(async () => {
    if (!connected || !address) {
      setProfile(null);
      setMetrics(null);
      setPositions([]);
      setTransactions([]);
      setAnalytics(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await profileService.getUserProfile(address);
      
      if (response.success) {
        setProfile(response.data.profile);
        setMetrics(response.data.metrics);
        setPositions(response.data.positions || []);
        setTransactions(response.data.recentTransactions || []);
      } else {
        throw new Error(response.error || 'Failed to load profile');
      }
    } catch (err) {
      console.error('Profile loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [connected, address]);

  // Load positions with filtering and pagination
  const loadPositions = useCallback(async (
    filter?: PositionFilter,
    pagination?: PaginationOptions
  ) => {
    if (!connected || !address) return;

    setIsLoadingPositions(true);
    setPositionsError(null);

    try {
      const response = await profileService.getPositions(address, filter, pagination);
      
      if (pagination?.page && pagination.page > 1) {
        // Append to existing positions for pagination
        setPositions(prev => [...prev, ...response.positions]);
      } else {
        // Replace positions for new filter or initial load
        setPositions(response.positions);
      }
      
      setHasMorePositions(response.hasMore);
    } catch (err) {
      console.error('Positions loading error:', err);
      setPositionsError(err instanceof Error ? err.message : 'Failed to load positions');
    } finally {
      setIsLoadingPositions(false);
    }
  }, [connected, address]);

  // Load transaction history with filtering and pagination
  const loadTransactions = useCallback(async (
    filter?: TransactionFilter,
    pagination?: PaginationOptions
  ) => {
    if (!connected || !address) return;

    setIsLoadingTransactions(true);
    setTransactionsError(null);

    try {
      const response = await profileService.getTransactionHistory(address, filter, pagination);
      
      if (response.success) {
        if (pagination?.page && pagination.page > 1) {
          // Append to existing transactions for pagination
          setTransactions(prev => [...prev, ...response.data.transactions]);
        } else {
          // Replace transactions for new filter or initial load
          setTransactions(response.data.transactions);
        }
        
        setHasMoreTransactions(response.data.hasMore);
      } else {
        throw new Error(response.error || 'Failed to load transactions');
      }
    } catch (err) {
      console.error('Transactions loading error:', err);
      setTransactionsError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [connected, address]);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    if (!connected || !address) return;

    setIsLoadingAnalytics(true);
    setAnalyticsError(null);

    try {
      const response = await profileService.getAnalytics(address);
      
      if (response.success) {
        setAnalytics(response.data);
      } else {
        throw new Error(response.error || 'Failed to load analytics');
      }
    } catch (err) {
      console.error('Analytics loading error:', err);
      setAnalyticsError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoadingAnalytics(false);
    }
  }, [connected, address]);

  // Update profile preferences
  const updateProfile = useCallback(async (updates: ProfileUpdateRequest): Promise<boolean> => {
    if (!connected || !address) return false;

    try {
      const response = await profileService.updateProfile(address, updates);
      
      if (response.success) {
        // Refresh profile data after successful update
        await refreshProfile();
        return true;
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  }, [connected, address, refreshProfile]);

  // Export user data
  const exportData = useCallback(async (options: any): Promise<string | null> => {
    if (!connected || !address) return null;

    try {
      const response = await profileService.exportData(address, options);
      
      if (response.success && response.downloadUrl) {
        return response.downloadUrl;
      } else {
        throw new Error(response.error || 'Failed to export data');
      }
    } catch (err) {
      console.error('Data export error:', err);
      setError(err instanceof Error ? err.message : 'Failed to export data');
      return null;
    }
  }, [connected, address]);

  // Load profile data when wallet connects
  useEffect(() => {
    if (connected && address) {
      refreshProfile();
    } else {
      // Clear data when wallet disconnects
      setProfile(null);
      setMetrics(null);
      setPositions([]);
      setTransactions([]);
      setAnalytics(null);
      setError(null);
      setPositionsError(null);
      setTransactionsError(null);
      setAnalyticsError(null);
    }
  }, [connected, address, refreshProfile]);

  return {
    // Data
    profile,
    metrics,
    positions,
    transactions,
    analytics,
    
    // Loading states
    isLoading,
    isLoadingPositions,
    isLoadingTransactions,
    isLoadingAnalytics,
    
    // Error states
    error,
    positionsError,
    transactionsError,
    analyticsError,
    
    // Pagination
    hasMorePositions,
    hasMoreTransactions,
    
    // Actions
    refreshProfile,
    loadPositions,
    loadTransactions,
    loadAnalytics,
    updateProfile,
    exportData,
  };
}

export default useProfile;