import {
  fetchCallReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  principalCV,
} from '@stacks/transactions';
import { STACKS_MAINNET, STACKS_TESTNET, type StacksNetwork } from '@stacks/network';
import type { SDKConfig } from '../types';
import type {
  UserLoan,
  ProtocolStats,
  ProtocolMetrics,
  VolumeMetrics,
  HealthFactor,
  RepaymentAmount,
  TransactionOptions,
  NetworkType,
} from '../types';
import {
  getContractAddress,
  parseContractAddress,
  PROTOCOL_CONSTANTS,
} from '../constants';
import { safeCvToValue, isValidStxAddress } from '../utils';

/**
 * VaultClient - Main interface for BitFlow Lending Protocol
 * 
 * Provides methods to interact with the vault-core smart contract
 * for deposits, borrows, repayments, and liquidations.
 */
export class VaultClient {
  private network: StacksNetwork;
  private networkType: NetworkType;
  private contractAddress: string;
  private contractName: string;

  constructor(config: SDKConfig) {
    this.networkType = config.network;
    this.network =
      config.network === 'mainnet' ? STACKS_MAINNET : STACKS_TESTNET;

    const fullAddress = getContractAddress('vaultCore', config.network);
    const parsed = parseContractAddress(fullAddress);
    this.contractAddress = parsed.address;
    this.contractName = parsed.name;
  }

  /**
   * Get network type
   */
  getNetwork(): NetworkType {
    return this.networkType;
  }

  /**
   * Get contract address
   */
  getContractAddress(): string {
    return `${this.contractAddress}.${this.contractName}`;
  }

  // ============================================================================
  // READ-ONLY FUNCTIONS (No gas required)
  // ============================================================================

  /**
   * Get user's deposit balance
   * 
   * @param userAddress - Stacks address to query
   * @returns User deposit amount in micro-STX
   */
  async getUserDeposit(userAddress: string): Promise<bigint> {
    if (!isValidStxAddress(userAddress)) {
      throw new Error('Invalid Stacks address');
    }

    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-user-deposit',
      functionArgs: [principalCV(userAddress)],
      network: this.network,
      senderAddress: userAddress,
    });

    return BigInt(safeCvToValue<number>(result) || 0);
  }

  /**
   * Get user's active loan details
   * 
   * @param userAddress - Stacks address to query
   * @returns User loan details or null if no active loan
   */
  async getUserLoan(userAddress: string): Promise<UserLoan | null> {
    if (!isValidStxAddress(userAddress)) {
      throw new Error('Invalid Stacks address');
    }

    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-user-loan',
      functionArgs: [principalCV(userAddress)],
      network: this.network,
      senderAddress: userAddress,
    });

    const value = safeCvToValue<any>(result);
    
    if (!value || value.type === 'none') {
      return null;
    }

    return {
      amount: BigInt(value.value.amount || 0),
      interestRate: BigInt(value.value['interest-rate'] || 0),
      startBlock: BigInt(value.value['start-block'] || 0),
      termEnd: BigInt(value.value['term-end'] || 0),
    };
  }

  /**
   * Get total protocol deposits
   * 
   * @returns Total deposits in micro-STX
   */
  async getTotalDeposits(): Promise<bigint> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-total-deposits',
      functionArgs: [],
      network: this.network,
      senderAddress: this.contractAddress,
    });

    return BigInt(safeCvToValue<number>(result) || 0);
  }

  /**
   * Get total amount repaid
   * 
   * @returns Total repaid in micro-STX
   */
  async getTotalRepaid(): Promise<bigint> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-total-repaid',
      functionArgs: [],
      network: this.network,
      senderAddress: this.contractAddress,
    });

    return BigInt(safeCvToValue<number>(result) || 0);
  }

  /**
   * Get total liquidations count
   * 
   * @returns Number of liquidations
   */
  async getTotalLiquidations(): Promise<bigint> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-total-liquidations',
      functionArgs: [],
      network: this.network,
      senderAddress: this.contractAddress,
    });

    return BigInt(safeCvToValue<number>(result) || 0);
  }

  /**
   * Get comprehensive protocol statistics
   * 
   * @returns Protocol statistics
   */
  async getProtocolStats(): Promise<ProtocolStats> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-protocol-stats',
      functionArgs: [],
      network: this.network,
      senderAddress: this.contractAddress,
    });

    const value = safeCvToValue<any>(result);

    return {
      totalDeposits: BigInt(value?.['total-deposits'] || 0),
      totalBorrowed: BigInt(value?.['total-borrowed'] || 0),
      totalRepaid: BigInt(value?.['total-repaid'] || 0),
      totalLiquidations: BigInt(value?.['total-liquidations'] || 0),
      activeLoans: BigInt(value?.['active-loans'] || 0),
    };
  }

  /**
   * Get protocol metrics
   * 
   * @returns Protocol metrics including utilization rate
   */
  async getProtocolMetrics(): Promise<ProtocolMetrics> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-protocol-metrics',
      functionArgs: [],
      network: this.network,
      senderAddress: this.contractAddress,
    });

    const value = safeCvToValue<any>(result);

    return {
      utilizationRate: BigInt(value?.['utilization-rate'] || 0),
      averageInterestRate: BigInt(value?.['average-interest-rate'] || 0),
      totalCollateral: BigInt(value?.['total-collateral'] || 0),
      totalDebt: BigInt(value?.['total-debt'] || 0),
    };
  }

  /**
   * Get volume metrics
   * 
   * @returns Volume metrics
   */
  async getVolumeMetrics(): Promise<VolumeMetrics> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-volume-metrics',
      functionArgs: [],
      network: this.network,
      senderAddress: this.contractAddress,
    });

    const value = safeCvToValue<any>(result);

    return {
      totalVolumeDeposited: BigInt(value?.['total-volume-deposited'] || 0),
      totalVolumeBorrowed: BigInt(value?.['total-volume-borrowed'] || 0),
      totalVolumeRepaid: BigInt(value?.['total-volume-repaid'] || 0),
      totalVolumeLiquidated: BigInt(value?.['total-volume-liquidated'] || 0),
    };
  }

  /**
   * Calculate health factor for a user
   * 
   * @param userAddress - Stacks address to check
   * @returns Health factor (>110% is safe, <110% is liquidatable)
   */
  async calculateHealthFactor(userAddress: string): Promise<HealthFactor> {
    if (!isValidStxAddress(userAddress)) {
      throw new Error('Invalid Stacks address');
    }

    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'calculate-health-factor',
      functionArgs: [principalCV(userAddress)],
      network: this.network,
      senderAddress: userAddress,
    });

    const factor = BigInt(safeCvToValue<number>(result) || 0);

    return {
      factor,
      isHealthy: factor >= PROTOCOL_CONSTANTS.LIQUIDATION_THRESHOLD,
    };
  }

  /**
   * Check if a position is liquidatable
   * 
   * @param userAddress - Stacks address to check
   * @returns True if position can be liquidated
   */
  async isLiquidatable(userAddress: string): Promise<boolean> {
    if (!isValidStxAddress(userAddress)) {
      throw new Error('Invalid Stacks address');
    }

    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'is-liquidatable',
      functionArgs: [principalCV(userAddress)],
      network: this.network,
      senderAddress: userAddress,
    });

    return Boolean(safeCvToValue<boolean>(result));
  }

  /**
   * Calculate repayment amount (principal + interest)
   * 
   * @param userAddress - Stacks address to check
   * @returns Repayment breakdown
   */
  async getRepaymentAmount(userAddress: string): Promise<RepaymentAmount> {
    if (!isValidStxAddress(userAddress)) {
      throw new Error('Invalid Stacks address');
    }

    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-repayment-amount',
      functionArgs: [principalCV(userAddress)],
      network: this.network,
      senderAddress: userAddress,
    });

    const value = safeCvToValue<any>(result);

    const principal = BigInt(value?.principal || 0);
    const interest = BigInt(value?.interest || 0);

    return {
      principal,
      interest,
      total: principal + interest,
    };
  }

  /**
   * Calculate required collateral for a loan amount
   * 
   * @param loanAmount - Desired loan amount in micro-STX
   * @returns Required collateral in micro-STX
   */
  async calculateRequiredCollateral(loanAmount: bigint): Promise<bigint> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'calculate-required-collateral',
      functionArgs: [uintCV(loanAmount)],
      network: this.network,
      senderAddress: this.contractAddress,
    });

    return BigInt(safeCvToValue<number>(result) || 0);
  }

  /**
   * Get contract version
   * 
   * @returns Contract version string
   */
  async getContractVersion(): Promise<string> {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'get-contract-version',
      functionArgs: [],
      network: this.network,
      senderAddress: this.contractAddress,
    });

    return safeCvToValue<string>(result) || 'unknown';
  }

  // ============================================================================
  // WRITE FUNCTIONS (Require transaction signing and gas)
  // ============================================================================

  /**
   * Deposit STX as collateral
   * 
   * @param amount - Amount to deposit in micro-STX
   * @param senderKey - Private key for signing
   * @param options - Transaction options
   * @returns Transaction ID
   */
  async deposit(
    amount: bigint,
    senderKey: string,
    options: TransactionOptions = {}
  ): Promise<string> {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'deposit',
      functionArgs: [uintCV(amount)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      fee: options.fee || PROTOCOL_CONSTANTS.DEFAULT_TX_FEE,
      ...(options.nonce && { nonce: options.nonce }),
      ...(options.postConditions && { postConditions: options.postConditions }),
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction({ transaction, network: this.network });

    if ('error' in result) {
      throw new Error(`Transaction failed: ${result.error}`);
    }

    return result.txid;
  }

  /**
   * Withdraw STX collateral
   * 
   * @param amount - Amount to withdraw in micro-STX
   * @param senderKey - Private key for signing
   * @param options - Transaction options
   * @returns Transaction ID
   */
  async withdraw(
    amount: bigint,
    senderKey: string,
    options: TransactionOptions = {}
  ): Promise<string> {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'withdraw',
      functionArgs: [uintCV(amount)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      fee: options.fee || PROTOCOL_CONSTANTS.DEFAULT_TX_FEE,
      ...(options.nonce && { nonce: options.nonce }),
      ...(options.postConditions && { postConditions: options.postConditions }),
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction({ transaction, network: this.network });

    if ('error' in result) {
      throw new Error(`Transaction failed: ${result.error}`);
    }

    return result.txid;
  }

  /**
   * Borrow STX against collateral
   * 
   * @param amount - Amount to borrow in micro-STX
   * @param interestRate - Interest rate in basis points
   * @param term - Loan term in blocks
   * @param senderKey - Private key for signing
   * @param options - Transaction options
   * @returns Transaction ID
   */
  async borrow(
    amount: bigint,
    interestRate: bigint,
    term: bigint,
    senderKey: string,
    options: TransactionOptions = {}
  ): Promise<string> {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'borrow',
      functionArgs: [uintCV(amount), uintCV(interestRate), uintCV(term)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      fee: options.fee || PROTOCOL_CONSTANTS.DEFAULT_TX_FEE,
      ...(options.nonce && { nonce: options.nonce }),
      ...(options.postConditions && { postConditions: options.postConditions }),
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction({ transaction, network: this.network });

    if ('error' in result) {
      throw new Error(`Transaction failed: ${result.error}`);
    }

    return result.txid;
  }

  /**
   * Repay active loan
   * 
   * @param senderKey - Private key for signing
   * @param options - Transaction options
   * @returns Transaction ID
   */
  async repay(
    senderKey: string,
    options: TransactionOptions = {}
  ): Promise<string> {
    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'repay',
      functionArgs: [],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      fee: options.fee || PROTOCOL_CONSTANTS.DEFAULT_TX_FEE,
      ...(options.nonce && { nonce: options.nonce }),
      ...(options.postConditions && { postConditions: options.postConditions }),
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction({ transaction, network: this.network });

    if ('error' in result) {
      throw new Error(`Transaction failed: ${result.error}`);
    }

    return result.txid;
  }

  /**
   * Liquidate an undercollateralized position
   * 
   * @param borrowerAddress - Address of the borrower to liquidate
   * @param senderKey - Private key for signing
   * @param options - Transaction options
   * @returns Transaction ID
   */
  async liquidate(
    borrowerAddress: string,
    senderKey: string,
    options: TransactionOptions = {}
  ): Promise<string> {
    if (!isValidStxAddress(borrowerAddress)) {
      throw new Error('Invalid borrower address');
    }

    const txOptions = {
      contractAddress: this.contractAddress,
      contractName: this.contractName,
      functionName: 'liquidate',
      functionArgs: [principalCV(borrowerAddress)],
      senderKey,
      network: this.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      fee: options.fee || PROTOCOL_CONSTANTS.DEFAULT_TX_FEE,
      ...(options.nonce && { nonce: options.nonce }),
      ...(options.postConditions && { postConditions: options.postConditions }),
    };

    const transaction = await makeContractCall(txOptions);
    const result = await broadcastTransaction({ transaction, network: this.network });

    if ('error' in result) {
      throw new Error(`Transaction failed: ${result.error}`);
    }

    return result.txid;
  }
}
