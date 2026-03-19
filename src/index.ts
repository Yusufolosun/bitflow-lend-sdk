// Main exports
export { VaultClient } from './client/VaultClient';

// Types
export type {
  NetworkType,
  SDKConfig,
  UserDeposit,
  UserLoan,
  ProtocolStats,
  ProtocolMetrics,
  VolumeMetrics,
  HealthFactor,
  RepaymentAmount,
  TransactionOptions,
  StakingPosition,
  PriceData,
  ContractCallResult,
} from './types';

// Constants
export {
  CONTRACT_ADDRESSES,
  NETWORK_URLS,
  PROTOCOL_CONSTANTS,
  ERROR_CODES,
  getContractAddress,
  getNetworkUrl,
  parseContractAddress,
} from './constants';

// Utilities
export {
  formatStx,
  toMicroStx,
  formatInterestRate,
  formatHealthFactor,
  isValidStxAddress,
  isValidContractId,
  calculateBlocksRemaining,
  blocksToTime,
  formatBlocksToTime,
  calculateRequiredCollateral,
  calculateMaxBorrow,
  calculateInterest,
} from './utils';
