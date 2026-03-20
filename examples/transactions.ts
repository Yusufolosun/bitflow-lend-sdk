/**
 * Transaction Example
 *
 * Shows how to deposit, borrow, and repay with proper error handling.
 *
 * SECURITY WARNINGS:
 * - NEVER hardcode private keys in source code
 * - NEVER commit .env files to version control
 * - Use hardware wallets or secure key management in production
 * - Only run this example on TESTNET
 */

import {
  VaultClient,
  toMicroStx,
  formatStx,
  // Error types for proper error handling
  InvalidAmountError,
  InvalidParameterError,
  InsufficientCollateralError,
  LoanActiveError,
  NoLoanError,
  TransactionFailedError,
  NetworkError,
  BitflowSDKError,
  PROTOCOL_CONSTANTS,
} from 'bitflow-lend-sdk';

async function main() {
  // SECURITY: Get private key from environment variable
  // NEVER hardcode private keys in source code
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('ERROR: PRIVATE_KEY environment variable required');
    console.error('');
    console.error('Usage:');
    console.error('  PRIVATE_KEY=your_key npx ts-node examples/transactions.ts');
    console.error('');
    console.error('SECURITY REMINDER:');
    console.error('  - Never commit private keys to version control');
    console.error('  - Only use testnet keys for testing');
    console.error('  - Use hardware wallets in production');
    process.exit(1);
  }

  // Validate private key format before proceeding
  if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
    console.error('ERROR: Invalid private key format');
    console.error('Expected: 64 hexadecimal characters');
    process.exit(1);
  }

  // Initialize TESTNET client - NEVER use mainnet for testing
  const client = new VaultClient({ network: 'testnet' });

  console.log('BitFlow Lend SDK - Transaction Example\n');
  console.log('WARNING: Using TESTNET\n');

  try {
    // 1. Deposit collateral
    console.log('Step 1: Depositing 1500 STX as collateral...');
    const depositAmount = toMicroStx(1500);

    // Validate amount before transaction
    if (depositAmount < PROTOCOL_CONSTANTS.MIN_DEPOSIT_AMOUNT) {
      throw new InvalidAmountError(
        `Deposit must be at least ${formatStx(PROTOCOL_CONSTANTS.MIN_DEPOSIT_AMOUNT)} STX`
      );
    }

    const depositTx = await client.deposit(depositAmount, privateKey);
    console.log(`Deposit transaction submitted: ${depositTx}`);

    // Wait for transaction confirmation
    console.log('Waiting for confirmation...');
    const depositStatus = await client.waitForTransaction(depositTx, {
      timeout: 300_000, // 5 minutes
      pollInterval: 15_000, // 15 seconds
    });

    if (depositStatus.status === 'success') {
      console.log(`Deposit confirmed in block ${depositStatus.blockHeight}\n`);
    } else {
      throw new TransactionFailedError(
        `Deposit failed: ${depositStatus.errorMessage || depositStatus.status}`,
        undefined,
        depositTx
      );
    }

    // 2. Borrow STX against collateral
    console.log('Step 2: Borrowing 1000 STX...');
    const borrowAmount = toMicroStx(1000);
    const interestRate = 500n; // 5% APR (in basis points)
    const term = 52560n; // 1 year in blocks (~10 min per block)

    // Display loan parameters
    console.log(`  Amount: ${formatStx(borrowAmount)} STX`);
    console.log(`  Interest Rate: ${interestRate / 100n}% APR`);
    console.log(`  Term: ${term} blocks (~1 year)`);

    const borrowTx = await client.borrow(
      borrowAmount,
      interestRate,
      term,
      privateKey
    );
    console.log(`Borrow transaction submitted: ${borrowTx}`);

    // Wait for borrow confirmation
    console.log('Waiting for confirmation...');
    const borrowStatus = await client.waitForTransaction(borrowTx, {
      timeout: 300_000,
      pollInterval: 15_000,
    });

    if (borrowStatus.status === 'success') {
      console.log(`Borrow confirmed in block ${borrowStatus.blockHeight}\n`);
    } else {
      throw new TransactionFailedError(
        `Borrow failed: ${borrowStatus.errorMessage || borrowStatus.status}`,
        undefined,
        borrowTx
      );
    }

    // 3. Check repayment amount (would need actual user address)
    // console.log('Step 3: Checking repayment amount...');
    // const repayment = await client.getRepaymentAmount(userAddress);
    // console.log(`  Principal: ${formatStx(repayment.principal)} STX`);
    // console.log(`  Interest: ${formatStx(repayment.interest)} STX`);
    // console.log(`  Total Due: ${formatStx(repayment.total)} STX\n`);

    // 4. Repay loan (uncomment when ready)
    // console.log('Step 4: Repaying loan...');
    // const repayTx = await client.repay(privateKey);
    // console.log(`Repay transaction: ${repayTx}`);
    // const repayStatus = await client.waitForTransaction(repayTx);
    // if (repayStatus.status === 'success') {
    //   console.log('Loan repaid successfully!\n');
    // }

    console.log('Example completed successfully');
  } catch (error) {
    // Handle specific error types with appropriate messages
    console.error('\nTransaction failed:');

    if (error instanceof InvalidAmountError) {
      console.error(`Invalid amount: ${error.message}`);
      if (error.minimumRequired) {
        console.error(`Minimum required: ${formatStx(error.minimumRequired)} STX`);
      }
    } else if (error instanceof InvalidParameterError) {
      console.error(`Invalid parameter: ${error.message}`);
    } else if (error instanceof InsufficientCollateralError) {
      console.error(`Insufficient collateral: ${error.message}`);
      console.error(`Required: ${formatStx(error.required)} STX`);
      console.error(`Available: ${formatStx(error.actual)} STX`);
    } else if (error instanceof LoanActiveError) {
      console.error('You already have an active loan. Repay it before borrowing again.');
    } else if (error instanceof NoLoanError) {
      console.error('No active loan found to repay.');
    } else if (error instanceof TransactionFailedError) {
      console.error(`Transaction failed: ${error.message}`);
      if (error.txId) {
        console.error(`Transaction ID: ${error.txId}`);
      }
      if (error.contractErrorCode) {
        console.error(`Contract error code: ${error.contractErrorCode}`);
      }
    } else if (error instanceof NetworkError) {
      console.error(`Network error: ${error.message}`);
      console.error('Check your internet connection and try again.');
    } else if (error instanceof BitflowSDKError) {
      console.error(`SDK error: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }

    process.exit(1);
  }
}

main();
