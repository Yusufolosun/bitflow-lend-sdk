/**
 * Network types supported by the SDK
 */
export type NetworkType = 'mainnet' | 'testnet';

/**
 * SDK configuration options
 */
export interface SDKConfig {
  network: NetworkType;
}

/**
 * User deposit information
 */
export interface UserDeposit {
  amount: bigint;
}

/**
 * Active loan details
 */
export interface UserLoan {
  amount: bigint;
  interestRate: bigint;
  startBlock: bigint;
  termEnd: bigint;
}

/**
 * Protocol statistics
 */
export interface ProtocolStats {
  totalDeposits: bigint;
  totalBorrowed: bigint;
  totalRepaid: bigint;
  totalLiquidations: bigint;
  activeLoans: bigint;
}

/**
 * Protocol metrics
 */
export interface ProtocolMetrics {
  utilizationRate: bigint;
  averageInterestRate: bigint;
  totalCollateral: bigint;
  totalDebt: bigint;
}

/**
 * Volume metrics
 */
export interface VolumeMetrics {
  totalVolumeDeposited: bigint;
  totalVolumeBorrowed: bigint;
  totalVolumeRepaid: bigint;
  totalVolumeLiquidated: bigint;
}

/**
 * Health factor result
 */
export interface HealthFactor {
  factor: bigint;
  isHealthy: boolean;
}

/**
 * Repayment calculation
 */
export interface RepaymentAmount {
  principal: bigint;
  interest: bigint;
  total: bigint;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
  fee?: bigint;
  nonce?: bigint;
  postConditions?: import('@stacks/transactions').PostCondition[];
}

/**
 * Staking position
 */
export interface StakingPosition {
  stakedAmount: bigint;
  shares: bigint;
  rewardsEarned: bigint;
  lastClaimBlock: bigint;
}

/**
 * Oracle price data
 */
export interface PriceData {
  price: bigint;
  timestamp: bigint;
  source: string;
}

/**
 * Contract call result
 */
export interface ContractCallResult<T> {
  success: boolean;
  value?: T;
  error?: string;
}

// Re-export Clarity types
export type {
  ClarityUserLoanResponse,
  ClarityProtocolStatsResponse,
  ClarityProtocolMetricsResponse,
  ClarityVolumeMetricsResponse,
  ClarityRepaymentAmountResponse,
  TransactionStatus,
} from './clarity';
