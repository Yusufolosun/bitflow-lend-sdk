import { ERROR_CODES } from '../constants';
import * as Errors from '../errors';

function toErrorRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
}

function toBigInt(value: unknown): bigint | null {
  try {
    if (typeof value === 'bigint') {
      return value;
    }

    if (typeof value === 'number' && Number.isInteger(value)) {
      return BigInt(value);
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (/^-?\d+$/.test(trimmed)) {
        return BigInt(trimmed);
      }
    }
  } catch {
    return null;
  }

  return null;
}

function extractErrorMessage(error: unknown): string | null {
  if (typeof error === 'string') {
    return error;
  }

  const errorRecord = toErrorRecord(error);
  if (errorRecord && typeof errorRecord.message === 'string') {
    return errorRecord.message;
  }

  return null;
}

/**
 * Parse contract error and return appropriate error instance
 */
export function parseContractError(error: unknown, txId?: string): Error {
  const errorCode = extractErrorCode(error);

  if (!errorCode) {
    return new Errors.TransactionFailedError(
      extractErrorMessage(error) || 'Transaction failed',
      undefined,
      txId
    );
  }

  switch (errorCode) {
    case ERROR_CODES.ERR_UNAUTHORIZED:
      return new Errors.UnauthorizedError();

    case ERROR_CODES.ERR_INSUFFICIENT_BALANCE:
      return new Errors.InsufficientBalanceError();

    case ERROR_CODES.ERR_LOAN_ACTIVE:
      return new Errors.LoanActiveError();

    case ERROR_CODES.ERR_NO_LOAN:
      return new Errors.NoLoanError();

    case ERROR_CODES.ERR_INSUFFICIENT_COLLATERAL:
      return new Errors.InsufficientCollateralError(
        'Insufficient collateral for this operation',
        0n,
        0n
      );

    case ERROR_CODES.ERR_LOAN_NOT_DUE:
      return new Errors.BitflowSDKError('Loan term has not ended yet');

    case ERROR_CODES.ERR_NOT_LIQUIDATABLE:
      return new Errors.NotLiquidatableError();

    case ERROR_CODES.ERR_INVALID_AMOUNT:
      return new Errors.InvalidAmountError('Invalid amount provided');

    case ERROR_CODES.ERR_PAUSED:
      return new Errors.ProtocolPausedError();

    default:
      return new Errors.TransactionFailedError(
        `Transaction failed with error code ${errorCode}`,
        errorCode,
        txId
      );
  }
}

/**
 * Extract error code from various error response formats
 */
function extractErrorCode(error: unknown): bigint | null {
  try {
    const errorRecord = toErrorRecord(error);

    // Check for error code in different possible locations
    if (errorRecord) {
      const valueCode = toBigInt(errorRecord.value);
      if (valueCode !== null) {
        return valueCode;
      }

      const errorCode = toBigInt(errorRecord.error_code);
      if (errorCode !== null) {
        return errorCode;
      }

      const code = toBigInt(errorRecord.code);
      if (code !== null) {
        return code;
      }
    }

    // Try to parse from error message
    const message = extractErrorMessage(error);
    if (message) {
      const match = message.match(/error\s+code\s+(\d+)/i);
      if (match) {
        return BigInt(match[1]);
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if error is a contract error
 */
export function isContractError(error: unknown): boolean {
  return extractErrorCode(error) !== null;
}

/**
 * Get human-readable error message from contract error code
 */
export function getErrorMessage(errorCode: bigint): string {
  switch (errorCode) {
    case ERROR_CODES.ERR_UNAUTHORIZED:
      return 'Unauthorized: You do not have permission for this operation';
    case ERROR_CODES.ERR_INSUFFICIENT_BALANCE:
      return 'Insufficient balance in your account';
    case ERROR_CODES.ERR_LOAN_ACTIVE:
      return 'You already have an active loan';
    case ERROR_CODES.ERR_NO_LOAN:
      return 'No active loan found for this address';
    case ERROR_CODES.ERR_INSUFFICIENT_COLLATERAL:
      return 'Insufficient collateral to perform this operation';
    case ERROR_CODES.ERR_LOAN_NOT_DUE:
      return 'Loan term has not ended yet';
    case ERROR_CODES.ERR_NOT_LIQUIDATABLE:
      return 'This position cannot be liquidated (health factor above threshold)';
    case ERROR_CODES.ERR_INVALID_AMOUNT:
      return 'Invalid amount: must be greater than minimum';
    case ERROR_CODES.ERR_PAUSED:
      return 'Protocol is currently paused for maintenance';
    default:
      return `Unknown error code: ${errorCode}`;
  }
}
