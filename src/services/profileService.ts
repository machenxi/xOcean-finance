// src/services/profileService.ts

import { API_BASE_URL } from '@/config/env';
import {
  UserProfile,
  PortfolioMetrics,
  Position,
  Transaction,
  AnalyticsData,
  ProfileApiResponse,
  TransactionHistoryApiResponse,
  AnalyticsApiResponse,
  TransactionFilter,
  PositionFilter,
  PaginationOptions,
  ProfileUpdateRequest,
  ExportOptions,
} from '@/types/profile';

class ProfileService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Fetch complete user profile data
   */
  async getUserProfile(address: string): Promise<ProfileApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/${address}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile preferences
   */
  async updateProfile(
    address: string,
    updates: ProfileUpdateRequest
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/${address}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update profile:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Fetch user's positions with filtering and pagination
   */
  async getPositions(
    address: string,
    filter?: PositionFilter,
    pagination?: PaginationOptions
  ): Promise<{ positions: Position[]; totalCount: number; hasMore: boolean }> {
    try {
      const params = new URLSearchParams();
      
      if (filter) {
        if (filter.type) params.append('type', filter.type.join(','));
        if (filter.asset) params.append('asset', filter.asset.join(','));
        if (filter.status) params.append('status', filter.status.join(','));
        if (filter.dateRange) {
          params.append('startDate', filter.dateRange.start.toISOString());
          params.append('endDate', filter.dateRange.end.toISOString());
        }
      }

      if (pagination) {
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());
        if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
        if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
      }

      const response = await fetch(
        `${this.baseUrl}/profile/${address}/positions?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      throw error;
    }
  }

  /**
   * Fetch transaction history with filtering and pagination
   */
  async getTransactionHistory(
    address: string,
    filter?: TransactionFilter,
    pagination?: PaginationOptions
  ): Promise<TransactionHistoryApiResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filter) {
        if (filter.type) params.append('type', filter.type.join(','));
        if (filter.asset) params.append('asset', filter.asset.join(','));
        if (filter.status) params.append('status', filter.status.join(','));
        if (filter.dateRange) {
          params.append('startDate', filter.dateRange.start.toISOString());
          params.append('endDate', filter.dateRange.end.toISOString());
        }
        if (filter.amountRange) {
          params.append('minAmount', filter.amountRange.min);
          params.append('maxAmount', filter.amountRange.max);
        }
      }

      if (pagination) {
        params.append('page', pagination.page.toString());
        params.append('limit', pagination.limit.toString());
        if (pagination.sortBy) params.append('sortBy', pagination.sortBy);
        if (pagination.sortOrder) params.append('sortOrder', pagination.sortOrder);
      }

      const response = await fetch(
        `${this.baseUrl}/profile/${address}/transactions?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch transaction history:', error);
      throw error;
    }
  }

  /**
   * Fetch analytics data
   */
  async getAnalytics(address: string): Promise<AnalyticsApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/${address}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }

  /**
   * Export user data
   */
  async exportData(
    address: string,
    options: ExportOptions
  ): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/profile/${address}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to export data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Calculate portfolio metrics from positions
   */
  calculatePortfolioMetrics(positions: Position[]): PortfolioMetrics {
    const activePositions = positions.filter(p => p.status === 'active');
    
    let totalLent = 0;
    let totalBorrowed = 0;
    let totalEarned = 0;
    let totalPaid = 0;

    activePositions.forEach(position => {
      const amount = parseFloat(position.amount);
      const accruedInterest = parseFloat(position.accruedInterest);

      if (position.type === 'lending') {
        totalLent += amount;
        totalEarned += accruedInterest;
      } else {
        totalBorrowed += amount;
        totalPaid += accruedInterest;
      }
    });

    const totalValue = totalLent - totalBorrowed;
    const netProfit = totalEarned - totalPaid;
    const roi = totalLent > 0 ? (netProfit / totalLent) * 100 : 0;

    // Calculate health score based on various factors
    const healthScore = this.calculateHealthScore(activePositions);
    
    // Determine liquidation risk
    const liquidationRisk = this.assessLiquidationRisk(activePositions);

    return {
      totalValue: totalValue.toFixed(2),
      totalLent: totalLent.toFixed(2),
      totalBorrowed: totalBorrowed.toFixed(2),
      totalEarned: totalEarned.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      netProfit: netProfit.toFixed(2),
      roi: parseFloat(roi.toFixed(2)),
      healthScore: Math.round(healthScore),
      liquidationRisk,
    };
  }

  /**
   * Calculate account health score
   */
  private calculateHealthScore(positions: Position[]): number {
    if (positions.length === 0) return 100;

    let score = 100;
    const borrowingPositions = positions.filter(p => p.type === 'borrowing');
    
    // Reduce score based on borrowing positions and collateralization
    borrowingPositions.forEach(position => {
      if (position.collateral) {
        const collateralValue = parseFloat(position.collateral.amount);
        const borrowedValue = parseFloat(position.amount);
        const ratio = collateralValue / borrowedValue;
        
        if (ratio < 1.5) score -= 20; // Under-collateralized
        else if (ratio < 2.0) score -= 10; // Low collateralization
      } else {
        score -= 30; // No collateral information
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess liquidation risk
   */
  private assessLiquidationRisk(positions: Position[]): 'low' | 'medium' | 'high' {
    const borrowingPositions = positions.filter(p => p.type === 'borrowing');
    
    if (borrowingPositions.length === 0) return 'low';

    let riskScore = 0;
    
    borrowingPositions.forEach(position => {
      if (position.collateral) {
        const collateralValue = parseFloat(position.collateral.amount);
        const borrowedValue = parseFloat(position.amount);
        const ratio = collateralValue / borrowedValue;
        
        if (ratio < 1.2) riskScore += 3; // High risk
        else if (ratio < 1.5) riskScore += 2; // Medium risk
        else if (ratio < 2.0) riskScore += 1; // Low risk
      } else {
        riskScore += 3; // Unknown collateral = high risk
      }
    });

    const avgRisk = riskScore / borrowingPositions.length;
    
    if (avgRisk >= 2.5) return 'high';
    if (avgRisk >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Format currency values
   */
  formatCurrency(amount: string | number, currency: string = 'USD'): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    }
    
    return `${value.toFixed(6)} ${currency}`;
  }

  /**
   * Format percentage values
   */
  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  /**
   * Get risk color class
   */
  getRiskColorClass(risk: 'low' | 'medium' | 'high'): string {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  /**
   * Get health score color class
   */
  getHealthScoreColorClass(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  }
}

// Export singleton instance
export const profileService = new ProfileService();
export default profileService;