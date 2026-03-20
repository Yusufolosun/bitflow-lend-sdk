/**
 * Clarity response types for smart contract calls
 */

/**
 * User loan response fromcontract
 */
export interface ClarityUserLoanResponse {
  type: 'some' | 'none';
  value?: {
    amount: number | bigint;
    'interest-rate': number | bigint;
    'start-block': number | bigint;
    'term-end': number | bigint;
  };
}

/**
 * Protocol stats response from contract
 */
export interface ClarityProtocolStatsResponse {
  'total-deposits': number | bigint;
  'total-borrowed': number | bigint;
  'total-repaid': number | bigint;
  'total-liquidations': number | bigint;
  'active-loans': number | bigint;
}

/**
 * Protocol metrics response from contract
 */
export interface ClarityProtocolMetricsResponse {
  'utilization-rate': number | bigint;
  'average-interest-rate': number | bigint;
  'total-collateral': number | bigint;
  'total-debt': number | bigint;
}

/**
 * Volume metrics response from contract
 */
export interface ClarityVolumeMetricsResponse {
  'total-volume-deposited': number | bigint;
  'total-volume-borrowed': number | bigint;
  'total-volume-repaid': number | bigint;
  'total-volume-liquidated': number | bigint;
}

/**
 * Repayment amount response from contract
 */
export interface ClarityRepaymentAmountResponse {
  principal: number | bigint;
  interest: number | bigint;
}

/**
 * Transaction status from Stacks API
 */
export interface TransactionStatus {
  txId: string;
  status: 'pending' | 'success' | 'failed' | 'abort_by_response' | 'abort_by_post_condition';
  blockHeight?: number;
  blockHash?: string;
  result?: string;
  errorMessage?: string;
}
