/**
 * Basic Usage Example
 *
 * Shows how to query user data and protocol statistics
 * with proper error handling using the SDK's custom error types.
 */

import {
  VaultClient,
  formatStx,
  formatHealthFactor,
  // Error types for proper error handling
  InvalidAddressError,
  NetworkError,
  BitflowSDKError,
} from '@yusufolosun/bitflow-lend-sdk';

async function main() {
  // Initialize client for mainnet
  const client = new VaultClient({ network: 'mainnet' });

  console.log('BitFlow Lend SDK - Basic Example\n');
  console.log(`Network: ${client.getNetwork()}`);
  console.log(`Contract: ${client.getContractAddress()}\n`);

  // Example address (deployed contract owner)
  const userAddress = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';

  try {
    // Get user deposit
    console.log('User Data');
    const deposit = await client.getUserDeposit(userAddress);
    console.log(`Deposit: ${formatStx(deposit)} STX`);

    // Get user loan
    const loan = await client.getUserLoan(userAddress);
    if (loan) {
      console.log(`Loan Amount: ${formatStx(loan.amount)} STX`);
      console.log(`Interest Rate: ${loan.interestRate / 100n}%`);
      console.log(`Start Block: ${loan.startBlock}`);
      console.log(`Term End: ${loan.termEnd}`);

      // Check health factor
      const health = await client.calculateHealthFactor(userAddress);
      console.log(`Health Factor: ${formatHealthFactor(health.factor)}`);
      console.log(`Status: ${health.isHealthy ? 'Healthy' : 'At Risk'}`);
    } else {
      console.log('No active loan');
    }

    // Get protocol statistics
    console.log('\nProtocol Statistics');
    const stats = await client.getProtocolStats();
    console.log(`Total Deposits: ${formatStx(stats.totalDeposits)} STX`);
    console.log(`Total Borrowed: ${formatStx(stats.totalBorrowed)} STX`);
    console.log(`Total Repaid: ${formatStx(stats.totalRepaid)} STX`);
    console.log(`Active Loans: ${stats.activeLoans}`);
    console.log(`Total Liquidations: ${stats.totalLiquidations}`);

    // Get protocol metrics
    console.log('\nProtocol Metrics');
    const metrics = await client.getProtocolMetrics();
    console.log(`Utilization Rate: ${metrics.utilizationRate / 100n}%`);
    console.log(`Average Interest Rate: ${metrics.averageInterestRate / 100n}%`);
    console.log(`Total Collateral: ${formatStx(metrics.totalCollateral)} STX`);
    console.log(`Total Debt: ${formatStx(metrics.totalDebt)} STX`);

    console.log('\nExample completed successfully');
  } catch (error) {
    // Handle specific error types
    if (error instanceof InvalidAddressError) {
      console.error('Invalid address provided:', error.message);
    } else if (error instanceof NetworkError) {
      console.error('Network error - check your connection:', error.message);
    } else if (error instanceof BitflowSDKError) {
      console.error('SDK error:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    process.exit(1);
  }
}

main();
