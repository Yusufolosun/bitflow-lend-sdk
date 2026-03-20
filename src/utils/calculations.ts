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
