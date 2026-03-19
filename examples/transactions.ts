/**
 * Transaction Example
 * 
 * Shows how to deposit, borrow, and repay
 * 
 * ⚠️ This requires a private key with STX balance
 * Only run on testnet for testing
 */

import { VaultClient, toMicroStx, formatStx } from 'bitflow-lend-sdk';

async function main() {
  // Get private key from environment
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY environment variable required');
  }

  // Initialize testnet client
  const client = new VaultClient({ network: 'testnet' });

  console.log('BitFlow Lend SDK - Transaction Example\n');
  console.log('⚠️  Using TESTNET\n');

  try {
    // 1. Deposit collateral
    console.log('1️⃣  Depositing 1500 STX as collateral...');
    const depositAmount = toMicroStx(1500);
    const depositTx = await client.deposit(depositAmount, privateKey);
    console.log(`✅ Deposit transaction: ${depositTx}`);
    console.log('⏳ Waiting for confirmation (~10 minutes)...\n');

    // In production, wait for confirmation here
    // await waitForTransaction(depositTx);

    // 2. Borrow STX
    console.log('2️⃣  Borrowing 1000 STX...');
    const borrowAmount = toMicroStx(1000);
    const interestRate = 500n; // 5% APR
    const term = 52560n; // 1 year in blocks

    const borrowTx = await client.borrow(
      borrowAmount,
      interestRate,
      term,
      privateKey
    );
    console.log(`✅ Borrow transaction: ${borrowTx}`);
    console.log(`   Amount: ${formatStx(borrowAmount)} STX`);
    console.log(`   Rate: ${interestRate / 100n}%`);
    console.log(`   Term: ${term} blocks (~1 year)\n`);

    // 3. Check repayment amount
    console.log('3️⃣  Checking repayment amount...');
    // In production, wait for borrow confirmation first
    // const repayment = await client.getRepaymentAmount(userAddress);
    // console.log(`   Principal: ${formatStx(repayment.principal)} STX`);
    // console.log(`   Interest: ${formatStx(repayment.interest)} STX`);
    // console.log(`   Total: ${formatStx(repayment.total)} STX\n`);

    // 4. Repay loan
    // console.log('4️⃣  Repaying loan...');
    // const repayTx = await client.repay(privateKey);
    // console.log(`✅ Repay transaction: ${repayTx}\n`);

    console.log('✅ Example completed successfully');
    console.log('\n⚠️  Remember to wait for block confirmations in production');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main().catch(console.error);
