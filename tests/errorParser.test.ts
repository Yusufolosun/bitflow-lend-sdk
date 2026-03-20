import { describe, it, expect } from 'vitest';
import {
  parseContractError,
  isContractError,
  getErrorMessage,
  ERROR_CODES,
  UnauthorizedError,
  InsufficientBalanceError,
  LoanActiveError,
  NoLoanError,
  InsufficientCollateralError,
  NotLiquidatableError,
  InvalidAmountError,
  ProtocolPausedError,
  TransactionFailedError,
  BitflowSDKError,
} from '../src';

describe('Error Parser', () => {
  describe('parseContractError', () => {
    it('should parse ERR_UNAUTHORIZED', () => {
      const error = parseContractError({ value: ERROR_CODES.ERR_UNAUTHORIZED });
      expect(error).toBeInstanceOf(UnauthorizedError);
    });

    it('should parse ERR_INSUFFICIENT_BALANCE', () => {
      const error = parseContractError({ value: ERROR_CODES.ERR_INSUFFICIENT_BALANCE });
      expect(error).toBeInstanceOf(InsufficientBalanceError);
    });

    it('should parse ERR_LOAN_ACTIVE', () => {
      const error = parseContractError({ value: ERROR_CODES.ERR_LOAN_ACTIVE });
      expect(error).toBeInstanceOf(LoanActiveError);
    });

    it('should parse ERR_NO_LOAN', () => {
      const error = parseContractError({ value: ERROR_CODES.ERR_NO_LOAN });
      expect(error).toBeInstanceOf(NoLoanError);
    });

    it('should parse ERR_INSUFFICIENT_COLLATERAL', () => {
      const error = parseContractError({ value: ERROR_CODES.ERR_INSUFFICIENT_COLLATERAL });
      expect(error).toBeInstanceOf(InsufficientCollateralError);
    });

    it('should parse ERR_NOT_LIQUIDATABLE', () => {
      const error = parseContractError({ value: ERROR_CODES.ERR_NOT_LIQUIDATABLE });
      expect(error).toBeInstanceOf(NotLiquidatableError);
    });

    it('should parse ERR_INVALID_AMOUNT', () => {
      const error = parseContractError({ value: ERROR_CODES.ERR_INVALID_AMOUNT });
      expect(error).toBeInstanceOf(InvalidAmountError);
    });

    it('should parse ERR_PAUSED', () => {
      const error = parseContractError({ value: ERROR_CODES.ERR_PAUSED });
      expect(error).toBeInstanceOf(ProtocolPausedError);
    });

    it('should parse ERR_LOAN_NOT_DUE', () => {
      const error = parseContractError({ value: ERROR_CODES.ERR_LOAN_NOT_DUE });
      expect(error).toBeInstanceOf(BitflowSDKError);
      expect(error.message).toContain('not ended');
    });

    it('should return TransactionFailedError for unknown error code', () => {
      const error = parseContractError({ value: 99999n });
      expect(error).toBeInstanceOf(TransactionFailedError);
      expect(error.message).toContain('99999');
    });

    it('should return TransactionFailedError when no error code', () => {
      const error = parseContractError({ message: 'Something went wrong' });
      expect(error).toBeInstanceOf(TransactionFailedError);
      expect(error.message).toContain('Something went wrong');
    });

    it('should include txId in TransactionFailedError', () => {
      const error = parseContractError({ message: 'Failed' }, 'tx123') as TransactionFailedError;
      expect(error).toBeInstanceOf(TransactionFailedError);
      expect(error.txId).toBe('tx123');
    });

    it('should parse error_code field', () => {
      const error = parseContractError({ error_code: ERROR_CODES.ERR_PAUSED });
      expect(error).toBeInstanceOf(ProtocolPausedError);
    });

    it('should parse code field', () => {
      const error = parseContractError({ code: ERROR_CODES.ERR_UNAUTHORIZED });
      expect(error).toBeInstanceOf(UnauthorizedError);
    });

    it('should parse error code from message string', () => {
      const error = parseContractError({ message: 'Contract returned error code 1000' });
      expect(error).toBeInstanceOf(UnauthorizedError);
    });

    it('should handle null/undefined gracefully', () => {
      expect(parseContractError(null)).toBeInstanceOf(TransactionFailedError);
      expect(parseContractError(undefined)).toBeInstanceOf(TransactionFailedError);
    });
  });

  describe('isContractError', () => {
    it('should return true for error with value', () => {
      expect(isContractError({ value: 100n })).toBe(true);
    });

    it('should return true for error with error_code', () => {
      expect(isContractError({ error_code: 100n })).toBe(true);
    });

    it('should return true for error with code', () => {
      expect(isContractError({ code: 100n })).toBe(true);
    });

    it('should return true for error with code in message', () => {
      expect(isContractError({ message: 'error code 100' })).toBe(true);
    });

    it('should return false for error without code', () => {
      expect(isContractError({ message: 'No code here' })).toBe(false);
    });

    it('should return false for null/undefined', () => {
      expect(isContractError(null)).toBe(false);
      expect(isContractError(undefined)).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return message for ERR_UNAUTHORIZED', () => {
      const msg = getErrorMessage(ERROR_CODES.ERR_UNAUTHORIZED);
      expect(msg).toContain('Unauthorized');
    });

    it('should return message for ERR_INSUFFICIENT_BALANCE', () => {
      const msg = getErrorMessage(ERROR_CODES.ERR_INSUFFICIENT_BALANCE);
      expect(msg).toContain('Insufficient balance');
    });

    it('should return message for ERR_LOAN_ACTIVE', () => {
      const msg = getErrorMessage(ERROR_CODES.ERR_LOAN_ACTIVE);
      expect(msg).toContain('active loan');
    });

    it('should return message for ERR_NO_LOAN', () => {
      const msg = getErrorMessage(ERROR_CODES.ERR_NO_LOAN);
      expect(msg).toContain('No active loan');
    });

    it('should return message for ERR_INSUFFICIENT_COLLATERAL', () => {
      const msg = getErrorMessage(ERROR_CODES.ERR_INSUFFICIENT_COLLATERAL);
      expect(msg).toContain('collateral');
    });

    it('should return message for ERR_LOAN_NOT_DUE', () => {
      const msg = getErrorMessage(ERROR_CODES.ERR_LOAN_NOT_DUE);
      expect(msg).toContain('not ended');
    });

    it('should return message for ERR_NOT_LIQUIDATABLE', () => {
      const msg = getErrorMessage(ERROR_CODES.ERR_NOT_LIQUIDATABLE);
      expect(msg).toContain('cannot be liquidated');
    });

    it('should return message for ERR_INVALID_AMOUNT', () => {
      const msg = getErrorMessage(ERROR_CODES.ERR_INVALID_AMOUNT);
      expect(msg).toContain('Invalid amount');
    });

    it('should return message for ERR_PAUSED', () => {
      const msg = getErrorMessage(ERROR_CODES.ERR_PAUSED);
      expect(msg).toContain('paused');
    });

    it('should return unknown message for unrecognized code', () => {
      const msg = getErrorMessage(99999n);
      expect(msg).toContain('Unknown error code');
      expect(msg).toContain('99999');
    });
  });
});
