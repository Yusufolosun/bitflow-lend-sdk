import { describe, it, expect } from 'vitest';
import {
  validateAmount,
  validateDeposit,
  validateWithdrawal,
  validateBorrow,
  validateAddress,
  validatePrivateKey,
  validateTransactionOptions,
  InvalidAmountError,
  InvalidParameterError,
  InvalidAddressError,
  PROTOCOL_CONSTANTS,
} from '../src';

describe('Validation Utilities', () => {
  describe('validateAmount', () => {
    it('should pass for valid amounts above minimum', () => {
      expect(() => validateAmount(1000000n, 100n, 'Test')).not.toThrow();
    });

    it('should throw for zero amount', () => {
      expect(() => validateAmount(0n, 100n, 'Deposit')).toThrow(InvalidAmountError);
      expect(() => validateAmount(0n, 100n, 'Deposit')).toThrow('cannot be zero');
    });

    it('should throw for negative amount', () => {
      expect(() => validateAmount(-100n, 100n, 'Deposit')).toThrow(InvalidAmountError);
      expect(() => validateAmount(-100n, 100n, 'Deposit')).toThrow('cannot be negative');
    });

    it('should throw for amount below minimum', () => {
      expect(() => validateAmount(50n, 100n, 'Deposit')).toThrow(InvalidAmountError);
      expect(() => validateAmount(50n, 100n, 'Deposit')).toThrow('below minimum');
    });

    it('should include minimum in error', () => {
      try {
        validateAmount(50n, 100n, 'Deposit');
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidAmountError);
        expect((error as InvalidAmountError).minimumRequired).toBe(100n);
        expect((error as InvalidAmountError).actual).toBe(50n);
      }
    });
  });

  describe('validateDeposit', () => {
    it('should pass for valid deposit amount', () => {
      const validAmount = PROTOCOL_CONSTANTS.MIN_DEPOSIT_AMOUNT + 1000000n;
      expect(() => validateDeposit(validAmount)).not.toThrow();
    });

    it('should pass for exact minimum deposit', () => {
      expect(() => validateDeposit(PROTOCOL_CONSTANTS.MIN_DEPOSIT_AMOUNT)).not.toThrow();
    });

    it('should throw for amount below minimum deposit', () => {
      const tooSmall = PROTOCOL_CONSTANTS.MIN_DEPOSIT_AMOUNT - 1n;
      expect(() => validateDeposit(tooSmall)).toThrow(InvalidAmountError);
    });

    it('should throw for zero deposit', () => {
      expect(() => validateDeposit(0n)).toThrow(InvalidAmountError);
    });
  });

  describe('validateWithdrawal', () => {
    it('should pass for valid withdrawal amount', () => {
      expect(() => validateWithdrawal(1000000n)).not.toThrow();
    });

    it('should throw for zero withdrawal', () => {
      expect(() => validateWithdrawal(0n)).toThrow(InvalidAmountError);
      expect(() => validateWithdrawal(0n)).toThrow('cannot be zero');
    });

    it('should throw for negative withdrawal', () => {
      expect(() => validateWithdrawal(-100n)).toThrow(InvalidAmountError);
      expect(() => validateWithdrawal(-100n)).toThrow('cannot be negative');
    });
  });

  describe('validateBorrow', () => {
    const validAmount = PROTOCOL_CONSTANTS.MIN_BORROW_AMOUNT + 1000000n;
    const validRate = 500n; // 5%
    const validTerm = PROTOCOL_CONSTANTS.BLOCKS_PER_DAY * 30n; // 30 days

    it('should pass for valid borrow parameters', () => {
      expect(() => validateBorrow(validAmount, validRate, validTerm)).not.toThrow();
    });

    it('should throw for amount below minimum', () => {
      const tooSmall = PROTOCOL_CONSTANTS.MIN_BORROW_AMOUNT - 1n;
      expect(() => validateBorrow(tooSmall, validRate, validTerm)).toThrow(InvalidAmountError);
    });

    it('should throw for zero interest rate', () => {
      expect(() => validateBorrow(validAmount, 0n, validTerm)).toThrow(InvalidParameterError);
      expect(() => validateBorrow(validAmount, 0n, validTerm)).toThrow('Interest rate cannot be zero');
    });

    it('should throw for negative interest rate', () => {
      expect(() => validateBorrow(validAmount, -100n, validTerm)).toThrow(InvalidParameterError);
      expect(() => validateBorrow(validAmount, -100n, validTerm)).toThrow('cannot be negative');
    });

    it('should throw for interest rate over 100%', () => {
      expect(() => validateBorrow(validAmount, 10001n, validTerm)).toThrow(InvalidParameterError);
      expect(() => validateBorrow(validAmount, 10001n, validTerm)).toThrow('exceeds maximum');
    });

    it('should pass for exactly 100% interest rate', () => {
      expect(() => validateBorrow(validAmount, 10000n, validTerm)).not.toThrow();
    });

    it('should throw for zero term', () => {
      expect(() => validateBorrow(validAmount, validRate, 0n)).toThrow(InvalidParameterError);
      expect(() => validateBorrow(validAmount, validRate, 0n)).toThrow('Loan term cannot be zero');
    });

    it('should throw for term shorter than 1 day', () => {
      const tooShort = PROTOCOL_CONSTANTS.BLOCKS_PER_DAY - 1n;
      expect(() => validateBorrow(validAmount, validRate, tooShort)).toThrow(InvalidParameterError);
      expect(() => validateBorrow(validAmount, validRate, tooShort)).toThrow('too short');
    });

    it('should throw for term longer than 10 years', () => {
      const tooLong = PROTOCOL_CONSTANTS.BLOCKS_PER_YEAR * 11n;
      expect(() => validateBorrow(validAmount, validRate, tooLong)).toThrow(InvalidParameterError);
      expect(() => validateBorrow(validAmount, validRate, tooLong)).toThrow('exceeds maximum');
    });
  });

  describe('validateAddress', () => {
    it('should pass for valid mainnet address', () => {
      expect(() => validateAddress('SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7')).not.toThrow();
    });

    it('should pass for valid testnet address', () => {
      expect(() => validateAddress('ST2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKQYAC0RQ')).not.toThrow();
    });

    it('should throw for empty address', () => {
      expect(() => validateAddress('')).toThrow(InvalidAddressError);
    });

    it('should throw for null address', () => {
      expect(() => validateAddress(null as unknown as string)).toThrow(InvalidAddressError);
    });

    it('should throw for invalid address format', () => {
      expect(() => validateAddress('invalid')).toThrow(InvalidAddressError);
      expect(() => validateAddress('0x1234')).toThrow(InvalidAddressError);
    });

    it('should include address type in error message', () => {
      expect(() => validateAddress('invalid', 'User address')).toThrow('User address');
      expect(() => validateAddress('invalid', 'Borrower')).toThrow('Borrower');
    });
  });

  describe('validatePrivateKey', () => {
    const validKey = 'a'.repeat(64);

    it('should pass for valid 64-char hex private key', () => {
      expect(() => validatePrivateKey(validKey)).not.toThrow();
      expect(() => validatePrivateKey('0123456789abcdef'.repeat(4))).not.toThrow();
      expect(() => validatePrivateKey('0123456789ABCDEF'.repeat(4))).not.toThrow();
    });

    it('should throw for empty private key', () => {
      expect(() => validatePrivateKey('')).toThrow(InvalidParameterError);
    });

    it('should throw for null private key', () => {
      expect(() => validatePrivateKey(null as unknown as string)).toThrow(InvalidParameterError);
    });

    it('should throw for key too short', () => {
      expect(() => validatePrivateKey('a'.repeat(63))).toThrow(InvalidParameterError);
      expect(() => validatePrivateKey('a'.repeat(63))).toThrow('64 hexadecimal');
    });

    it('should throw for key too long', () => {
      expect(() => validatePrivateKey('a'.repeat(65))).toThrow(InvalidParameterError);
    });

    it('should throw for non-hex characters', () => {
      expect(() => validatePrivateKey('g'.repeat(64))).toThrow(InvalidParameterError);
      expect(() => validatePrivateKey('z'.repeat(64))).toThrow(InvalidParameterError);
    });
  });

  describe('validateTransactionOptions', () => {
    it('should pass for empty options', () => {
      expect(() => validateTransactionOptions({})).not.toThrow();
    });

    it('should pass for undefined options', () => {
      expect(() => validateTransactionOptions(undefined)).not.toThrow();
    });

    it('should pass for valid fee', () => {
      expect(() => validateTransactionOptions({ fee: 1000n })).not.toThrow();
    });

    it('should pass for valid nonce', () => {
      expect(() => validateTransactionOptions({ nonce: 5n })).not.toThrow();
    });

    it('should throw for negative fee', () => {
      expect(() => validateTransactionOptions({ fee: -100n })).toThrow(InvalidParameterError);
      expect(() => validateTransactionOptions({ fee: -100n })).toThrow('cannot be negative');
    });

    it('should throw for negative nonce', () => {
      expect(() => validateTransactionOptions({ nonce: -1n })).toThrow(InvalidParameterError);
      expect(() => validateTransactionOptions({ nonce: -1n })).toThrow('cannot be negative');
    });

    it('should throw for non-bigint fee', () => {
      expect(() => validateTransactionOptions({ fee: 100 as unknown as bigint })).toThrow(InvalidParameterError);
      expect(() => validateTransactionOptions({ fee: 100 as unknown as bigint })).toThrow('must be a bigint');
    });

    it('should throw for non-bigint nonce', () => {
      expect(() => validateTransactionOptions({ nonce: 5 as unknown as bigint })).toThrow(InvalidParameterError);
    });

    it('should throw for null options', () => {
      expect(() => validateTransactionOptions(null)).toThrow(InvalidParameterError);
      expect(() => validateTransactionOptions(null)).toThrow('must be an object');
    });

    it('should throw for array options', () => {
      expect(() => validateTransactionOptions([])).toThrow(InvalidParameterError);
      expect(() => validateTransactionOptions([])).toThrow('must be an object');
    });
  });
});
