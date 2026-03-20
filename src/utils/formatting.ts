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
