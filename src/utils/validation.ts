import { PROTOCOL_CONSTANTS } from '../constants';
import {
  InvalidAmountError,
  InvalidParameterError,
  InvalidAddressError,
} from '../errors';
import { formatStx } from './formatting';
import { isValidStxAddress } from './address';

/**
 * Validate STX amount
 */
export function validateAmount(
  amount: bigint,
  min: bigint,
  operation: string
): void {
  if (amount === 0n) {
    throw new InvalidAmountError(`${operation} amount cannot be zero`);
  }

  if (amount < 0n) {
    throw new InvalidAmountError(`${operation} amount cannot be negative`);
  }

  if (amount < min) {
    throw new InvalidAmountError(
      `${operation} amount ${formatStx(amount)} STX is below minimum ${formatStx(min)} STX`,
      min,
      amount
    );
  }
}

/**
 * Validate deposit parameters
 */
export function validateDeposit(amount: bigint): void {
  validateAmount(amount, PROTOCOL_CONSTANTS.MIN_DEPOSIT_AMOUNT, 'Deposit');
}

/**
 * Validate withdrawal parameters
 */
export function validateWithdrawal(amount: bigint): void {
  if (amount === 0n) {
    throw new InvalidAmountError('Withdrawal amount cannot be zero');
  }

  if (amount < 0n) {
    throw new InvalidAmountError('Withdrawal amount cannot be negative');
  }
}

/**
 * Validate borrow parameters
 */
export function validateBorrow(
  amount: bigint,
  interestRate: bigint,
  term: bigint
): void {
  // Validate amount
  validateAmount(amount, PROTOCOL_CONSTANTS.MIN_BORROW_AMOUNT, 'Borrow');

  // Validate interest rate
  if (interestRate === 0n) {
    throw new InvalidParameterError('Interest rate cannot be zero');
  }

  if (interestRate < 0n) {
    throw new InvalidParameterError('Interest rate cannot be negative');
  }

  if (interestRate > 10000n) {
    throw new InvalidParameterError(
      `Interest rate ${interestRate / 100n}% exceeds maximum allowed (100%)`
    );
  }

  // Validate term
  if (term === 0n) {
    throw new InvalidParameterError('Loan term cannot be zero');
  }

  if (term < 0n) {
    throw new InvalidParameterError('Loan term cannot be negative');
  }

  const maxTerm = PROTOCOL_CONSTANTS.BLOCKS_PER_YEAR * 10n; // 10 years
  if (term > maxTerm) {
    throw new InvalidParameterError(
      `Loan term ${term} blocks exceeds maximum (${maxTerm} blocks / 10 years)`
    );
  }

  // Warn if term is very short (less than 1 day)
  if (term < PROTOCOL_CONSTANTS.BLOCKS_PER_DAY) {
    throw new InvalidParameterError(
      `Loan term ${term} blocks is too short (minimum ${PROTOCOL_CONSTANTS.BLOCKS_PER_DAY} blocks / 1 day)`
    );
  }
}

/**
 * Validate Stacks address
 */
export function validateAddress(address: string, addressType?: string): void {
  if (!address || typeof address !== 'string') {
    throw new InvalidAddressError(
      `${addressType || 'Address'} must be a non-empty string`
    );
  }

  if (!isValidStxAddress(address)) {
    throw new InvalidAddressError(
      `${addressType || 'Address'} "${address}" is not a valid Stacks address`
    );
  }
}

/**
 * Validate private key format
 */
export function validatePrivateKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new InvalidParameterError('Private key must be a non-empty string');
  }

  // Stacks private keys are 64 hex characters (32 bytes)
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    throw new InvalidParameterError(
      'Invalid private key format (expected 64 hexadecimal characters)'
    );
  }
}

/**
 * Validate transaction options
 */
export function validateTransactionOptions(options: any): void {
  if (options.fee !== undefined) {
    if (typeof options.fee !== 'bigint') {
      throw new InvalidParameterError('Transaction fee must be a bigint');
    }
    if (options.fee < 0n) {
      throw new InvalidParameterError('Transaction fee cannot be negative');
    }
  }

  if (options.nonce !== undefined) {
    if (typeof options.nonce !== 'bigint') {
      throw new InvalidParameterError('Nonce must be a bigint');
    }
    if (options.nonce < 0n) {
      throw new InvalidParameterError('Nonce cannot be negative');
    }
  }
}
