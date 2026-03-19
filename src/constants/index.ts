import type { NetworkType } from '../types';

/**
 * Contract addresses for different networks
 */
export const CONTRACT_ADDRESSES = {
  mainnet: {
    vaultCore: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.bitflow-vault-core',
    vaultCoreV2: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.bitflow-vault-core-v2',
    stakingPool: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.bitflow-staking-pool',
    oracleRegistry: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.bitflow-oracle-registry',
  },
  testnet: {
    vaultCore: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.bitflow-vault-core',
    vaultCoreV2: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.bitflow-vault-core-v2',
    stakingPool: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.bitflow-staking-pool',
    oracleRegistry: 'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.bitflow-oracle-registry',
  },
} as const;

/**
 * Network API URLs
 */
export const NETWORK_URLS = {
  mainnet: 'https://api.mainnet.hiro.so',
  testnet: 'https://api.testnet.hiro.so',
} as const;

/**
 * Protocol constants
 */
export const PROTOCOL_CONSTANTS = {
  // Collateralization ratios (basis points, 150% = 15000)
  COLLATERAL_RATIO: 15000n,
  LIQUIDATION_THRESHOLD: 11000n,
  
  // Interest rate precision (basis points)
  INTEREST_RATE_PRECISION: 10000n,
  
  // Minimum loan amounts (micro-STX)
  MIN_BORROW_AMOUNT: 100000000n, // 100 STX
  MIN_DEPOSIT_AMOUNT: 1000000n,  // 1 STX
  
  // Block times
  BLOCKS_PER_YEAR: 52560n, // ~10 min per block
  BLOCKS_PER_DAY: 144n,
  
  // Fee amounts
  DEFAULT_TX_FEE: 10000n, // 0.01 STX
} as const;

/**
 * Error codes from smart contracts
 */
export const ERROR_CODES = {
  ERR_UNAUTHORIZED: 1000n,
  ERR_INSUFFICIENT_BALANCE: 1001n,
  ERR_LOAN_ACTIVE: 1002n,
  ERR_NO_LOAN: 1003n,
  ERR_INSUFFICIENT_COLLATERAL: 1004n,
  ERR_LOAN_NOT_DUE: 1005n,
  ERR_NOT_LIQUIDATABLE: 1006n,
  ERR_INVALID_AMOUNT: 1007n,
  ERR_PAUSED: 1008n,
} as const;

/**
 * Helper to parse contract address
 */
export function parseContractAddress(fullAddress: string): {
  address: string;
  name: string;
} {
  const [address, name] = fullAddress.split('.');
  return { address, name };
}

/**
 * Get contract address for network
 */
export function getContractAddress(
  contract: keyof typeof CONTRACT_ADDRESSES.mainnet,
  network: NetworkType
): string {
  return CONTRACT_ADDRESSES[network][contract];
}

/**
 * Get API URL for network
 */
export function getNetworkUrl(network: NetworkType): string {
  return NETWORK_URLS[network];
}
