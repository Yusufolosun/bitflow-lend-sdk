# @yusufolosun/bitflow-lend-sdk

[![npm version](https://badge.fury.io/js/@yusufolosun%2Fbitflow-lend-sdk.svg)](https://www.npmjs.com/package/@yusufolosun/bitflow-lend-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

Professional TypeScript SDK for [BitFlow Lend](https://github.com/Yusufolosun/bitflow-lend) - Bitcoin-native fixed-rate lending protocol on Stacks blockchain.

## Features

- ✅ **Type-safe** - Full TypeScript support with comprehensive type definitions
- ✅ **Network agnostic** - Works seamlessly on mainnet and testnet
- ✅ **Zero dependencies** - Only peer dependencies on Stacks packages
- ✅ **Production ready** - Built on battle-tested mainnet contracts
- ✅ **Developer friendly** - Simple API, excellent documentation
- ✅ **Tree-shakeable** - ESM and CommonJS support

## Installation

```bash
npm install @yusufolosun/bitflow-lend-sdk @stacks/transactions @stacks/network
```

```bash
yarn add @yusufolosun/bitflow-lend-sdk @stacks/transactions @stacks/network
```

```bash
pnpm add @yusufolosun/bitflow-lend-sdk @stacks/transactions @stacks/network
```

## Quick Start

```typescript
import { VaultClient, toMicroStx, formatStx } from '@yusufolosun/bitflow-lend-sdk';

// Initialize client
const client = new VaultClient({ network: 'mainnet' });

// Query user data (read-only, no gas)
const deposit = await client.getUserDeposit('SP2...');
console.log(`Deposit: ${formatStx(deposit)} STX`);

const loan = await client.getUserLoan('SP2...');
if (loan) {
  console.log(`Loan: ${formatStx(loan.amount)} STX`);
  console.log(`Interest Rate: ${loan.interestRate / 100n}%`);
}

// Check protocol stats
const stats = await client.getProtocolStats();
console.log(`Total Deposits: ${formatStx(stats.totalDeposits)} STX`);
console.log(`Active Loans: ${stats.activeLoans}`);

// Deposit collateral (requires private key)
const txId = await client.deposit(
  toMicroStx(1000), // 1000 STX
  'your-private-key-hex'
);
console.log(`Transaction: ${txId}`);
```

## API Overview

### VaultClient

Main interface for the BitFlow lending protocol.

#### Read Operations (No Gas)

```typescript
// User data
await client.getUserDeposit(address: string): Promise<bigint>
await client.getUserLoan(address: string): Promise<UserLoan | null>
await client.getRepaymentAmount(address: string): Promise<RepaymentAmount>
await client.calculateHealthFactor(address: string): Promise<HealthFactor>
await client.isLiquidatable(address: string): Promise<boolean>

// Protocol data
await client.getProtocolStats(): Promise<ProtocolStats>
await client.getProtocolMetrics(): Promise<ProtocolMetrics>
await client.getVolumeMetrics(): Promise<VolumeMetrics>
await client.getTotalDeposits(): Promise<bigint>
await client.getTotalRepaid(): Promise<bigint>
await client.getTotalLiquidations(): Promise<bigint>

// Utilities
await client.calculateRequiredCollateral(amount: bigint): Promise<bigint>
await client.getContractVersion(): Promise<string>

// Transaction helpers
await client.getTransactionStatus(txId: string): Promise<TransactionStatus>
await client.waitForTransaction(txId: string, options?): Promise<TransactionStatus>
```

#### Write Operations (Requires Transaction)

```typescript
// Deposit STX as collateral
await client.deposit(
  amount: bigint,
  senderKey: string,
  options?: TransactionOptions
): Promise<string>

// Withdraw collateral
await client.withdraw(
  amount: bigint,
  senderKey: string,
  options?: TransactionOptions
): Promise<string>

// Borrow STX
await client.borrow(
  amount: bigint,
  interestRate: bigint,
  term: bigint,
  senderKey: string,
  options?: TransactionOptions
): Promise<string>

// Repay loan
await client.repay(
  senderKey: string,
  options?: TransactionOptions
): Promise<string>

// Liquidate position
await client.liquidate(
  borrowerAddress: string,
  senderKey: string,
  options?: TransactionOptions
): Promise<string>
```

## Usage Examples

### Check User Position

```typescript
import { VaultClient, formatStx, formatHealthFactor } from '@yusufolosun/bitflow-lend-sdk';

const client = new VaultClient({ network: 'mainnet' });
const userAddress = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';

// Get deposit
const deposit = await client.getUserDeposit(userAddress);
console.log(`Collateral: ${formatStx(deposit)} STX`);

// Get loan
const loan = await client.getUserLoan(userAddress);
if (loan) {
  console.log(`Borrowed: ${formatStx(loan.amount)} STX`);
  console.log(`Rate: ${loan.interestRate / 100n}%`);
  console.log(`Term ends at block: ${loan.termEnd}`);
  
  // Check health
  const health = await client.calculateHealthFactor(userAddress);
  console.log(`Health Factor: ${formatHealthFactor(health.factor)}`);
  console.log(`Status: ${health.isHealthy ? '✅ Healthy' : '⚠️ At Risk'}`);
}
```

### Deposit and Borrow

```typescript
import { VaultClient, toMicroStx } from '@yusufolosun/bitflow-lend-sdk';

const client = new VaultClient({ network: 'testnet' });
const privateKey = process.env.PRIVATE_KEY!;

// Deposit 1500 STX as collateral
const depositTx = await client.deposit(
  toMicroStx(1500),
  privateKey
);
console.log(`Deposit tx: ${depositTx}`);

// Wait for confirmation (~10 minutes)
// ...

// Borrow 1000 STX at 5% APR for 1 year
const borrowTx = await client.borrow(
  toMicroStx(1000),      // amount
  500n,                   // 5% interest rate (basis points)
  52560n,                 // 1 year in blocks
  privateKey
);
console.log(`Borrow tx: ${borrowTx}`);
```

### Monitor Protocol

```typescript
import { VaultClient, formatStx } from '@yusufolosun/bitflow-lend-sdk';

const client = new VaultClient({ network: 'mainnet' });

// Get comprehensive stats
const stats = await client.getProtocolStats();
console.log('📊 Protocol Statistics');
console.log(`Total Deposits: ${formatStx(stats.totalDeposits)} STX`);
console.log(`Total Borrowed: ${formatStx(stats.totalBorrowed)} STX`);
console.log(`Total Repaid: ${formatStx(stats.totalRepaid)} STX`);
console.log(`Active Loans: ${stats.activeLoans}`);
console.log(`Liquidations: ${stats.totalLiquidations}`);

// Get metrics
const metrics = await client.getProtocolMetrics();
console.log(`\n📈 Protocol Metrics`);
console.log(`Utilization: ${metrics.utilizationRate / 100n}%`);
console.log(`Avg Interest: ${metrics.averageInterestRate / 100n}%`);
```

### Calculate Loan Requirements

```typescript
import {
  calculateRequiredCollateral,
  calculateMaxBorrow,
  calculateInterest,
  toMicroStx,
  formatStx
} from '@yusufolosun/bitflow-lend-sdk';

// How much collateral for 1000 STX loan?
const collateral = calculateRequiredCollateral(toMicroStx(1000));
console.log(`Required: ${formatStx(collateral)} STX`); // 1500 STX (150%)

// How much can I borrow with 2000 STX?
const maxLoan = calculateMaxBorrow(toMicroStx(2000));
console.log(`Max loan: ${formatStx(maxLoan)} STX`); // ~1333 STX

// What's the interest on 1000 STX at 5% for 6 months?
const interest = calculateInterest(
  toMicroStx(1000),  // principal
  500n,              // 5% rate
  26280n             // 6 months in blocks
);
console.log(`Interest: ${formatStx(interest)} STX`); // ~25 STX
```

## TypeScript Support

Full type definitions included:

```typescript
import type {
  UserLoan,
  ProtocolStats,
  HealthFactor,
  RepaymentAmount,
  NetworkType,
  SDKConfig,
} from '@yusufolosun/bitflow-lend-sdk';

// All return types are properly typed
const loan: UserLoan = await client.getUserLoan(address);
const stats: ProtocolStats = await client.getProtocolStats();
```

## Network Support

### Mainnet

```typescript
const client = new VaultClient({ network: 'mainnet' });
// Contract: SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.bitflow-vault-core-v2
```

### Testnet

```typescript
const client = new VaultClient({ network: 'testnet' });
// Contract: ST1N3809W9CBWWX04KN3TCQHP8A9GN520BDRPWBVD.bitflow-vault-core-v2
```

## Constants

Access protocol constants:

```typescript
import { PROTOCOL_CONSTANTS } from '@yusufolosun/bitflow-lend-sdk';

console.log(PROTOCOL_CONSTANTS.COLLATERAL_RATIO);      // 15000n (150%)
console.log(PROTOCOL_CONSTANTS.LIQUIDATION_THRESHOLD); // 11000n (110%)
console.log(PROTOCOL_CONSTANTS.MIN_BORROW_AMOUNT);     // 100 STX
console.log(PROTOCOL_CONSTANTS.BLOCKS_PER_YEAR);       // 52560
```

## Utility Functions

```typescript
import {
  formatStx,
  toMicroStx,
  formatInterestRate,
  formatHealthFactor,
  isValidStxAddress,
  blocksToTime,
  formatBlocksToTime,
} from '@yusufolosun/bitflow-lend-sdk';

// Formatting
formatStx(1500000000n);          // "1,500.00"
toMicroStx(1500);                // 1500000000n
formatInterestRate(500n);        // "5.00%"
formatHealthFactor(15000n);      // "150.00%"

// Validation
isValidStxAddress('SP2...');     // true

// Time calculations
blocksToTime(7200n);             // { days: 50, hours: 0, minutes: 0 }
formatBlocksToTime(144n);        // "1d 0h"
```

## Error Handling

The SDK provides comprehensive error types for better error handling:

```typescript
import {
  VaultClient,
  // Error types
  InvalidAddressError,
  InvalidAmountError,
  InvalidParameterError,
  InsufficientCollateralError,
  TransactionFailedError,
  NetworkError,
  LoanActiveError,
  NoLoanError,
  BitflowSDKError,
} from '@yusufolosun/bitflow-lend-sdk';

try {
  const txId = await client.deposit(amount, privateKey);

  // Wait for confirmation
  const status = await client.waitForTransaction(txId);
  if (status.status === 'success') {
    console.log('Deposit confirmed!');
  }
} catch (error) {
  if (error instanceof InvalidAmountError) {
    console.error('Invalid amount:', error.message);
    if (error.minimumRequired) {
      console.error('Minimum required:', error.minimumRequired);
    }
  } else if (error instanceof InvalidParameterError) {
    console.error('Invalid parameter:', error.message);
  } else if (error instanceof InsufficientCollateralError) {
    console.error('Need more collateral:', error.required, 'vs', error.actual);
  } else if (error instanceof TransactionFailedError) {
    console.error('Transaction failed:', error.message);
    console.error('Error code:', error.contractErrorCode);
  } else if (error instanceof NetworkError) {
    console.error('Network issue:', error.message);
  } else if (error instanceof BitflowSDKError) {
    console.error('SDK error:', error.message);
  }
}
```

## Security

**CRITICAL: Follow these security practices when using this SDK.**

### Private Key Handling

```typescript
// NEVER do this - hardcoded keys
const privateKey = 'abc123...'; // DANGEROUS!

// NEVER commit .env files
// Add to .gitignore: .env, *.env.*, .env.local

// DO: Use environment variables
// Start from .env.example and provide a testnet key locally
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error('PRIVATE_KEY environment variable required');
}

// DO: Validate key format before use
if (!/^[0-9a-fA-F]{64}$/.test(privateKey)) {
  throw new Error('Invalid private key format');
}
```

### Post-Conditions

The SDK uses `PostConditionMode.Allow` for flexibility. For maximum security, provide explicit post-conditions:

```typescript
import { makeStandardSTXPostCondition, FungibleConditionCode } from '@stacks/transactions';

const postConditions = [
  makeStandardSTXPostCondition(
    senderAddress,
    FungibleConditionCode.LessEqual,
    depositAmount
  ),
];

await client.deposit(amount, privateKey, { postConditions });
```

### Input Validation

The SDK validates all inputs before transactions:

- Amounts must be positive and above protocol minimums
- Interest rates must be between 0-100%
- Loan terms must be between 1 day and 10 years
- Addresses must be valid Stacks format
- Private keys must be 64 hex characters

### Files to Never Commit

Ensure your `.gitignore` includes:

```
.env
*.env.*
.env.local
wallet.json
**/secrets/
**/.secrets/
*.key
*.pem
*.p12
*.keystore
mnemonic.txt
```

### Best Practices

1. **Use testnet first** - Always test on testnet before mainnet
2. **Wait for confirmations** - Use `waitForTransaction()` before acting on txs
3. **Handle all errors** - Wrap SDK calls in try/catch
4. **Validate user input** - Don't trust frontend data
5. **Use hardware wallets** - For production, integrate with Ledger/Trezor
6. **Monitor positions** - Set up alerts for health factor changes

## Smart Contract

This SDK interfaces with the BitFlow Lend smart contracts deployed on Stacks:

- **Mainnet**: `SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.bitflow-vault-core-v2`
- **Testnet**: `ST1N3809W9CBWWX04KN3TCQHP8A9GN520BDRPWBVD.bitflow-vault-core-v2`

[View on Explorer](https://explorer.hiro.so/txid/SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.bitflow-vault-core-v2?chain=mainnet)

## Links

- [Examples](https://github.com/Yusufolosun/bitflow-lend-sdk/tree/main/examples)
- [BitFlow Lend Protocol](https://github.com/Yusufolosun/bitflow-lend)
- [Stacks Blockchain](https://www.stacks.co/)

## License

MIT © BitFlow Lend

## Contributing

Contributions welcome! Please open an issue or PR.

---

**Built for the Stacks ecosystem**
