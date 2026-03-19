import type { ClarityValue } from '@stacks/transactions';
import { cvToValue } from '@stacks/transactions';

/**
 * Format micro-STX to STX (divides by 1,000,000)
 */
export function formatStx(microStx: bigint): string {
  const stx = Number(microStx) / 1_000_000;
  return stx.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

/**
 * Convert STX to micro-STX
 */
export function toMicroStx(stx: number): bigint {
  return BigInt(Math.floor(stx * 1_000_000));
}

/**
 * Format interest rate from basis points to percentage
 */
export function formatInterestRate(basisPoints: bigint): string {
  const percent = Number(basisPoints) / 100;
  return `${percent.toFixed(2)}%`;
}

/**
 * Calculate health factor as percentage
 */
export function formatHealthFactor(factor: bigint): string {
  const percent = Number(factor) / 100;
  return `${percent.toFixed(2)}%`;
}

/**
 * Safely convert Clarity value to JavaScript value
 */
export function safeCvToValue<T>(cv: ClarityValue): T | null {
  try {
    return cvToValue(cv) as T;
  } catch {
    return null;
  }
}

/**
 * Validate STX address
 */
export function isValidStxAddress(address: string): boolean {
  // Mainnet starts with SP, testnet with ST
  return /^(SP|ST)[0-9A-Z]{38,41}$/.test(address);
}

/**
 * Validate contract identifier
 */
export function isValidContractId(contractId: string): boolean {
  const parts = contractId.split('.');
  return parts.length === 2 && isValidStxAddress(parts[0]) && parts[1].length > 0;
}

/**
 * Calculate time remaining in blocks
 */
export function calculateBlocksRemaining(
  currentBlock: bigint,
  endBlock: bigint
): bigint {
  return endBlock > currentBlock ? endBlock - currentBlock : 0n;
}

/**
 * Estimate time from blocks (assumes 10 min per block)
 */
export function blocksToTime(blocks: bigint): {
  days: number;
  hours: number;
  minutes: number;
} {
  const totalMinutes = Number(blocks) * 10;
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  
  return { days, hours, minutes };
}

/**
 * Format blocks to human readable time
 */
export function formatBlocksToTime(blocks: bigint): string {
  const { days, hours, minutes } = blocksToTime(blocks);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Calculate required collateral for a loan amount
 */
export function calculateRequiredCollateral(
  loanAmount: bigint,
  collateralRatio: bigint = 15000n
): bigint {
  return (loanAmount * collateralRatio) / 10000n;
}

/**
 * Calculate maximum borrowable amount from collateral
 */
export function calculateMaxBorrow(
  collateral: bigint,
  collateralRatio: bigint = 15000n
): bigint {
  return (collateral * 10000n) / collateralRatio;
}

/**
 * Calculate simple interest
 */
export function calculateInterest(
  principal: bigint,
  interestRate: bigint,
  blocks: bigint,
  blocksPerYear: bigint = 52560n
): bigint {
  return (principal * interestRate * blocks) / (10000n * blocksPerYear);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
