// src/types/profile.ts

export interface UserProfile {
  address: string;
  network: string;
  joinDate: Date;
  totalTransactions: number;
  accountHealthScore: number;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  preferences?: UserPreferences;
  metadata?: {
    lastLogin?: Date;
    profileVersion?: string;
    [key: string]: any;
  };
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    liquidationAlerts: boolean;
    positionUpdates: boolean;
    marketUpdates: boolean;
  };
  privacy: {
    showPortfolioValue: boolean;
    showTransactionHistory: boolean;
    allowAnalytics: boolean;
  };
  display: {
    currency: 'USD' | 'XRP' | 'RLUSD';
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

export interface PortfolioMetrics {
  totalValue: string;
  totalLent: string;
  totalBorrowed: string;
  totalEarned: string;
  totalPaid: string;
  netProfit: string;
  roi: number;
  healthScore: number;
  liquidationRisk: 'low' | 'medium' | 'high';
  collateralizationRatio?: number;
  availableCredit?: string;
  utilizationRate?: number;
}

export interface Position {
  id: string;
  type: 'lending' | 'borrowing';
  asset: string;
  amount: string;
  originalAmount: string;
  interestRate: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'withdrawn' | 'defaulted' | 'liquidated';
  accruedInterest: string;
  totalReturn?: string;
  counterparty?: string;
  escrowAddress?: string;
  transactionHash: string;
  collateral?: {
    asset: string;
    amount: string;
    liquidationThreshold: number;
  };
  metadata?: {
    [key: string]: any;
  };
}

export interface Transaction {
  id: string;
  hash: string;
  type: 'deposit' | 'withdraw' | 'lend' | 'borrow' | 'repay' | 'liquidation' | 'interest_payment';
  asset: string;
  amount: string;
  fee?: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
  blockHeight?: number;
  counterparty?: string;
  positionId?: string;
  metadata?: {
    gasUsed?: string;
    gasPrice?: string;
    confirmations?: number;
    [key: string]: any;
  };
}

export interface RiskMetrics {
  healthScore: number;
  liquidationRisk: 'low' | 'medium' | 'high';
  collateralizationRatio: number;
  liquidationThreshold: number;
  timeToLiquidation?: number; // in hours
  riskFactors: {
    priceVolatility: number;
    concentrationRisk: number;
    counterpartyRisk: number;
    liquidityRisk: number;
  };
  recommendations: string[];
}

export interface EarningsData {
  totalEarned: string;
  totalPaid: string;
  netEarnings: string;
  averageAPY: number;
  bestPerformingAsset: {
    asset: string;
    apy: number;
    earnings: string;
  };
  earningsHistory: {
    date: Date;
    amount: string;
    asset: string;
    type: 'interest' | 'fee' | 'liquidation_bonus';
  }[];
  projectedEarnings: {
    daily: string;
    weekly: string;
    monthly: string;
    yearly: string;
  };
}

export interface AnalyticsData {
  portfolioPerformance: {
    date: Date;
    totalValue: number;
    roi: number;
  }[];
  assetAllocation: {
    asset: string;
    percentage: number;
    value: string;
  }[];
  riskMetrics: RiskMetrics;
  earnings: EarningsData;
  activitySummary: {
    totalTransactions: number;
    totalVolume: string;
    averagePositionSize: string;
    activeDays: number;
  };
}

export interface ExportOptions {
  format: 'csv' | 'json' | 'pdf';
  dateRange: {
    start: Date;
    end: Date;
  };
  includeTransactions: boolean;
  includePositions: boolean;
  includeAnalytics: boolean;
  includePersonalData: boolean;
}

export interface ProfileUpdateRequest {
  preferences?: Partial<UserPreferences>;
  metadata?: Record<string, any>;
}

// API Response types
export interface ProfileApiResponse {
  success: boolean;
  data: {
    profile: UserProfile;
    metrics: PortfolioMetrics;
    positions: Position[];
    recentTransactions: Transaction[];
  };
  error?: string;
}

export interface TransactionHistoryApiResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    totalCount: number;
    hasMore: boolean;
  };
  error?: string;
}

export interface AnalyticsApiResponse {
  success: boolean;
  data: AnalyticsData;
  error?: string;
}

// Filter and pagination types
export interface TransactionFilter {
  type?: Transaction['type'][];
  asset?: string[];
  status?: Transaction['status'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: string;
    max: string;
  };
}

export interface PositionFilter {
  type?: Position['type'][];
  asset?: string[];
  status?: Position['status'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Component prop types
export interface ProfileComponentProps {
  className?: string;
  onUpdate?: () => void;
  onError?: (error: string) => void;
}

export interface ChartDataPoint {
  date: Date;
  value: number;
  label?: string;
}

export interface ChartProps {
  data: ChartDataPoint[];
  title?: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
}