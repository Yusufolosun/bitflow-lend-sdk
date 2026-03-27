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
  TransactionStatus,
  ClarityUserLoanResponse,
  ClarityProtocolStatsResponse,
  ClarityProtocolMetricsResponse,
  ClarityVolumeMetricsResponse,
  ClarityRepaymentAmountResponse,
} from '../types';
import {
  getContractAddress,
  parseContractAddress,
  PROTOCOL_CONSTANTS,
  getNetworkUrl,
} from '../constants';
import { safeCvToValue } from '../utils/clarity';
import { isValidStxAddress } from '../utils/address';
import {
  validateAddress,
  validatePrivateKey,
  validateDeposit,
  validateWithdrawal,
  validateBorrow,
  validateTransactionOptions,
} from '../utils/validation';
import { parseContractError } from '../utils/errorParser';
import { NetworkError } from '../errors';

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
   * @throws {InvalidAddressError} If address format is invalid
   * @throws {NetworkError} If network request fails
   */
  async getUserDeposit(userAddress: string): Promise<bigint> {
    validateAddress(userAddress, 'User address');

    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-user-deposit',
        functionArgs: [principalCV(userAddress)],
        network: this.network,
        senderAddress: userAddress,
      });

      return BigInt(safeCvToValue<number>(result) || 0);
    } catch (error) {
      throw new NetworkError(`Failed to fetch user deposit: ${(error as Error).message}`);
    }
  }

  /**
   * Get user's active loan details
   *
   * @param userAddress - Stacks address to query
   * @returns User loan details or null if no active loan
   * @throws {InvalidAddressError} If address format is invalid
   * @throws {NetworkError} If network request fails
   */
  async getUserLoan(userAddress: string): Promise<UserLoan | null> {
    validateAddress(userAddress, 'User address');

    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-user-loan',
        functionArgs: [principalCV(userAddress)],
        network: this.network,
        senderAddress: userAddress,
      });

      const value = safeCvToValue<ClarityUserLoanResponse>(result);

      if (!value || value.type === 'none') {
        return null;
      }

      return {
        amount: BigInt(value.value!.amount || 0),
        interestRate: BigInt(value.value!['interest-rate'] || 0),
        startBlock: BigInt(value.value!['start-block'] || 0),
        termEnd: BigInt(value.value!['term-end'] || 0),
      };
    } catch (error) {
      throw new NetworkError(`Failed to fetch user loan: ${(error as Error).message}`);
    }
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
   * @throws {NetworkError} If network request fails
   */
  async getProtocolStats(): Promise<ProtocolStats> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-protocol-stats',
        functionArgs: [],
        network: this.network,
        senderAddress: this.contractAddress,
      });

      const value = safeCvToValue<ClarityProtocolStatsResponse>(result);

      return {
        totalDeposits: BigInt(value?.['total-deposits'] || 0),
        totalBorrowed: BigInt(value?.['total-borrowed'] || 0),
        totalRepaid: BigInt(value?.['total-repaid'] || 0),
        totalLiquidations: BigInt(value?.['total-liquidations'] || 0),
        activeLoans: BigInt(value?.['active-loans'] || 0),
      };
    } catch (error) {
      throw new NetworkError(`Failed to fetch protocol stats: ${(error as Error).message}`);
    }
  }

  /**
   * Get protocol metrics
   *
   * @returns Protocol metrics including utilization rate
   * @throws {NetworkError} If network request fails
   */
  async getProtocolMetrics(): Promise<ProtocolMetrics> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-protocol-metrics',
        functionArgs: [],
        network: this.network,
        senderAddress: this.contractAddress,
      });

      const value = safeCvToValue<ClarityProtocolMetricsResponse>(result);

      return {
        utilizationRate: BigInt(value?.['utilization-rate'] || 0),
        averageInterestRate: BigInt(value?.['average-interest-rate'] || 0),
        totalCollateral: BigInt(value?.['total-collateral'] || 0),
        totalDebt: BigInt(value?.['total-debt'] || 0),
      };
    } catch (error) {
      throw new NetworkError(`Failed to fetch protocol metrics: ${(error as Error).message}`);
    }
  }

  /**
   * Get volume metrics
   *
   * @returns Volume metrics
   * @throws {NetworkError} If network request fails
   */
  async getVolumeMetrics(): Promise<VolumeMetrics> {
    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-volume-metrics',
        functionArgs: [],
        network: this.network,
        senderAddress: this.contractAddress,
      });

      const value = safeCvToValue<ClarityVolumeMetricsResponse>(result);

      return {
        totalVolumeDeposited: BigInt(value?.['total-volume-deposited'] || 0),
        totalVolumeBorrowed: BigInt(value?.['total-volume-borrowed'] || 0),
        totalVolumeRepaid: BigInt(value?.['total-volume-repaid'] || 0),
        totalVolumeLiquidated: BigInt(value?.['total-volume-liquidated'] || 0),
      };
    } catch (error) {
      throw new NetworkError(`Failed to fetch volume metrics: ${(error as Error).message}`);
    }
  }

  /**
   * Calculate health factor for a user
   *
   * @param userAddress - Stacks address to check
   * @returns Health factor (>110% is safe, <110% is liquidatable)
   * @throws {InvalidAddressError} If address format is invalid
   * @throws {NetworkError} If network request fails
   */
  async calculateHealthFactor(userAddress: string): Promise<HealthFactor> {
    validateAddress(userAddress, 'User address');

    try {
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
    } catch (error) {
      throw new NetworkError(`Failed to calculate health factor: ${(error as Error).message}`);
    }
  }

  /**
   * Check if a position is liquidatable
   *
   * @param userAddress - Stacks address to check
   * @returns True if position can be liquidated
   * @throws {InvalidAddressError} If address format is invalid
   * @throws {NetworkError} If network request fails
   */
  async isLiquidatable(userAddress: string): Promise<boolean> {
    validateAddress(userAddress, 'User address');

    try {
      const result = await fetchCallReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'is-liquidatable',
        functionArgs: [principalCV(userAddress)],
        network: this.network,
        senderAddress: userAddress,
      });

      return Boolean(safeCvToValue<boolean>(result));
    } catch (error) {
      throw new NetworkError(`Failed to check liquidatable status: ${(error as Error).message}`);
    }
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

    const value = safeCvToValue<ClarityRepaymentAmountResponse>(result);

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
   * @param senderKey - Private key for signing (64 hex characters)
   * @param options - Transaction options
   * @returns Transaction ID
   * @throws {InvalidAmountError} If amount is invalid or below minimum
   * @throws {InvalidParameterError} If private key or options are invalid
   * @throws {TransactionFailedError} If transaction fails
   *
   * @example
   * ```typescript
   * const txId = await client.deposit(
   *   toMicroStx(1000),
   *   privateKey
   * );
   * ```
   */
  async deposit(
    amount: bigint,
    senderKey: string,
    options: TransactionOptions = {}
  ): Promise<string> {
    // Validate inputs
    validateDeposit(amount);
    validatePrivateKey(senderKey);
    validateTransactionOptions(options);

    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'deposit',
        functionArgs: [uintCV(amount)],
        senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: options.fee ?? PROTOCOL_CONSTANTS.DEFAULT_TX_FEE,
        ...(options.nonce !== undefined && { nonce: options.nonce }),
        ...(options.postConditions && { postConditions: options.postConditions }),
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network: this.network });

      if ('error' in result) {
        throw parseContractError(result, undefined);
      }

      return result.txid;
    } catch (error) {
      if (error instanceof Error && error.name.includes('Bitflow')) {
        throw error;
      }
      throw parseContractError(error);
    }
  }

  /**
   * Withdraw STX collateral
   *
   * @param amount - Amount to withdraw in micro-STX
   * @param senderKey - Private key for signing (64 hex characters)
   * @param options - Transaction options
   * @returns Transaction ID
   * @throws {InvalidAmountError} If amount is invalid
   * @throws {InvalidParameterError} If private key or options are invalid
   * @throws {TransactionFailedError} If transaction fails
   * @throws {InsufficientCollateralError} If withdrawal would under-collateralize loan
   */
  async withdraw(
    amount: bigint,
    senderKey: string,
    options: TransactionOptions = {}
  ): Promise<string> {
    // Validate inputs
    validateWithdrawal(amount);
    validatePrivateKey(senderKey);
    validateTransactionOptions(options);

    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'withdraw',
        functionArgs: [uintCV(amount)],
        senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: options.fee ?? PROTOCOL_CONSTANTS.DEFAULT_TX_FEE,
        ...(options.nonce !== undefined && { nonce: options.nonce }),
        ...(options.postConditions && { postConditions: options.postConditions }),
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network: this.network });

      if ('error' in result) {
        throw parseContractError(result, undefined);
      }

      return result.txid;
    } catch (error) {
      if (error instanceof Error && error.name.includes('Bitflow')) {
        throw error;
      }
      throw parseContractError(error);
    }
  }

  /**
   * Borrow STX against collateral
   *
   * @param amount - Amount to borrow in micro-STX
   * @param interestRate - Interest rate in basis points (e.g., 500 = 5%)
   * @param term - Loan term in blocks
   * @param senderKey - Private key for signing (64 hex characters)
   * @param options - Transaction options
   * @returns Transaction ID
   * @throws {InvalidAmountError} If amount is invalid or below minimum
   * @throws {InvalidParameterError} If rate, term, key, or options are invalid
   * @throws {LoanActiveError} If user already has an active loan
   * @throws {InsufficientCollateralError} If collateral is insufficient
   * @throws {TransactionFailedError} If transaction fails
   *
   * @example
   * ```typescript
   * const txId = await client.borrow(
   *   toMicroStx(1000),
   *   500n,  // 5% APR
   *   52560n, // 1 year
   *   privateKey
   * );
   * ```
   */
  async borrow(
    amount: bigint,
    interestRate: bigint,
    term: bigint,
    senderKey: string,
    options: TransactionOptions = {}
  ): Promise<string> {
    // Validate inputs
    validateBorrow(amount, interestRate, term);
    validatePrivateKey(senderKey);
    validateTransactionOptions(options);

    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'borrow',
        functionArgs: [uintCV(amount), uintCV(interestRate), uintCV(term)],
        senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: options.fee ?? PROTOCOL_CONSTANTS.DEFAULT_TX_FEE,
        ...(options.nonce !== undefined && { nonce: options.nonce }),
        ...(options.postConditions && { postConditions: options.postConditions }),
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network: this.network });

      if ('error' in result) {
        throw parseContractError(result, undefined);
      }

      return result.txid;
    } catch (error) {
      if (error instanceof Error && error.name.includes('Bitflow')) {
        throw error;
      }
      throw parseContractError(error);
    }
  }

  /**
   * Repay active loan
   *
   * @param senderKey - Private key for signing (64 hex characters)
   * @param options - Transaction options
   * @returns Transaction ID
   * @throws {InvalidParameterError} If private key or options are invalid
   * @throws {NoLoanError} If no active loan exists
   * @throws {InsufficientBalanceError} If insufficient funds to repay
   * @throws {TransactionFailedError} If transaction fails
   */
  async repay(
    senderKey: string,
    options: TransactionOptions = {}
  ): Promise<string> {
    // Validate inputs
    validatePrivateKey(senderKey);
    validateTransactionOptions(options);

    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'repay',
        functionArgs: [],
        senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: options.fee ?? PROTOCOL_CONSTANTS.DEFAULT_TX_FEE,
        postConditions: options.postConditions || [],
        ...(options.nonce !== undefined && { nonce: options.nonce }),
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network: this.network });

      if ('error' in result) {
        throw parseContractError(result, undefined);
      }

      return result.txid;
    } catch (error) {
      if (error instanceof Error && error.name.includes('Bitflow')) {
        throw error;
      }
      throw parseContractError(error);
    }
  }

  /**
   * Liquidate an undercollateralized position
   *
   * @param borrowerAddress - Address of the borrower to liquidate
   * @param senderKey - Private key for signing (64 hex characters)
   * @param options - Transaction options
   * @returns Transaction ID
   * @throws {InvalidAddressError} If borrower address is invalid
   * @throws {InvalidParameterError} If private key or options are invalid
   * @throws {NotLiquidatableError} If position is not liquidatable
   * @throws {TransactionFailedError} If transaction fails
   */
  async liquidate(
    borrowerAddress: string,
    senderKey: string,
    options: TransactionOptions = {}
  ): Promise<string> {
    // Validate inputs
    validateAddress(borrowerAddress, 'Borrower address');
    validatePrivateKey(senderKey);
    validateTransactionOptions(options);

    try {
      const txOptions = {
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'liquidate',
        functionArgs: [principalCV(borrowerAddress)],
        senderKey,
        network: this.network,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: options.fee ?? PROTOCOL_CONSTANTS.DEFAULT_TX_FEE,
        postConditions: options.postConditions || [],
        ...(options.nonce !== undefined && { nonce: options.nonce }),
      };

      const transaction = await makeContractCall(txOptions);
      const result = await broadcastTransaction({ transaction, network: this.network });

      if ('error' in result) {
        throw parseContractError(result, undefined);
      }

      return result.txid;
    } catch (error) {
      if (error instanceof Error && error.name.includes('Bitflow')) {
        throw error;
      }
      throw parseContractError(error);
    }
  }

  // ============================================================================
  // TRANSACTION HELPERS
  // ============================================================================

  /**
   * Get transaction status from Stacks blockchain
   *
   * @param txId - Transaction ID to check
   * @returns Transaction status
   * @throws {NetworkError} If network request fails
   */
  async getTransactionStatus(txId: string): Promise<TransactionStatus> {
    try {
      const url = `${getNetworkUrl(this.networkType)}/extended/v1/tx/${txId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as {
        tx_status: string;
        block_height?: number;
        block_hash?: string;
        tx_result?: string;
        error?: string;
      };

      return {
        txId,
        status: data.tx_status as TransactionStatus['status'],
        blockHeight: data.block_height,
        blockHash: data.block_hash,
        result: data.tx_result,
        errorMessage: data.error,
      };
    } catch (error) {
      throw new NetworkError(`Failed to fetch transaction status: ${(error as Error).message}`);
    }
  }

  /**
   * Wait for transaction confirmation
   *
   * Polls the network until the transaction is confirmed or times out.
   *
   * @param txId - Transaction ID to wait for
   * @param options - Polling options
   * @param options.timeout - Maximum time to wait in milliseconds (default: 600000 = 10 minutes)
   * @param options.pollInterval - Time between polls in milliseconds (default: 10000 = 10 seconds)
   * @returns Final transaction status
   * @throws {NetworkError} If timeout is reached or network error occurs
   */
  async waitForTransaction(
    txId: string,
    options: {
      timeout?: number;
      pollInterval?: number;
    } = {}
  ): Promise<TransactionStatus> {
    const timeout = options.timeout || 600_000; // 10 minutes default
    const pollInterval = options.pollInterval || 10_000; // 10 seconds default
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.getTransactionStatus(txId);

        // Check if transaction is in final state
        if (
          status.status === 'success' ||
          status.status === 'failed' ||
          status.status === 'abort_by_response' ||
          status.status === 'abort_by_post_condition'
        ) {
          return status;
        }

        // Wait before polling again
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      } catch (error) {
        // Continue polling on network errors unless timeout reached
        if (Date.now() - startTime >= timeout) {
          throw new NetworkError(`Timeout waiting for transaction ${txId}`);
        }
        // Wait a bit before retrying on error
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }
    }

    throw new NetworkError(`Timeout waiting for transaction ${txId} after ${timeout}ms`);
  }
}
