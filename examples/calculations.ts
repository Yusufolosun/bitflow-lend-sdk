/**
 * Calculations Example
 * 
 * Shows how to use utility functions for loan calculations
 */

import {
  calculateRequiredCollateral,
  calculateMaxBorrow,
  calculateInterest,
  toMicroStx,
  formatStx,
  blocksToTime,
  formatBlocksToTime,
  PROTOCOL_CONSTANTS,
} from '@yusufolosun/bitflow-lend-sdk';

function main() {
  console.log('BitFlow Lend SDK - Calculations Example\n');

  // 1. Calculate required collateral
  console.log('1️⃣  Required Collateral');
  const loanAmount = toMicroStx(1000);
  const collateral = calculateRequiredCollateral(loanAmount);
  console.log(`   Loan: ${formatStx(loanAmount)} STX`);
  console.log(`   Required Collateral: ${formatStx(collateral)} STX`);
  console.log(`   Ratio: ${PROTOCOL_CONSTANTS.COLLATERAL_RATIO / 100n}%\n`);

  // 2. Calculate max borrow
  console.log('2️⃣  Maximum Borrowable');
  const myCollateral = toMicroStx(2000);
  const maxBorrow = calculateMaxBorrow(myCollateral);
  console.log(`   Collateral: ${formatStx(myCollateral)} STX`);
  console.log(`   Max Borrow: ${formatStx(maxBorrow)} STX\n`);

  // 3. Calculate interest
  console.log('3️⃣  Interest Calculations');
  const principal = toMicroStx(1000);
  const rate = 500n; // 5% APR

  // 6 months
  const interest6mo = calculateInterest(principal, rate, 26280n);
  console.log(`   6 months at 5%: ${formatStx(interest6mo)} STX`);

  // 1 year
  const interest1yr = calculateInterest(principal, rate, 52560n);
  console.log(`   1 year at 5%: ${formatStx(interest1yr)} STX`);

  // 2 years
  const interest2yr = calculateInterest(principal, rate, 105120n);
  console.log(`   2 years at 5%: ${formatStx(interest2yr)} STX\n`);

  // 4. Time conversions
  console.log('4️⃣  Time Conversions');
  const blocks = 7200n; // ~50 days
  const time = blocksToTime(blocks);
  console.log(`   ${blocks} blocks = ${time.days} days, ${time.hours} hours`);
  console.log(`   Formatted: ${formatBlocksToTime(blocks)}\n`);

  // 5. Protocol constants
  console.log('5️⃣  Protocol Constants');
  console.log(`   Collateral Ratio: ${PROTOCOL_CONSTANTS.COLLATERAL_RATIO / 100n}%`);
  console.log(`   Liquidation Threshold: ${PROTOCOL_CONSTANTS.LIQUIDATION_THRESHOLD / 100n}%`);
  console.log(`   Min Borrow: ${formatStx(PROTOCOL_CONSTANTS.MIN_BORROW_AMOUNT)} STX`);
  console.log(`   Min Deposit: ${formatStx(PROTOCOL_CONSTANTS.MIN_DEPOSIT_AMOUNT)} STX`);
  console.log(`   Blocks/Year: ${PROTOCOL_CONSTANTS.BLOCKS_PER_YEAR}`);

  console.log('\n✅ Example completed successfully');
}

main();
