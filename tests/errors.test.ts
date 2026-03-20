import { describe, it, expect } from 'vitest';
import {
  BitflowSDKError,
  InvalidAddressError,
  InvalidAmountError,
  InvalidParameterError,
  InsufficientCollateralError,
  TransactionFailedError,
  NetworkError,
  UnauthorizedError,
  LoanActiveError,
  NoLoanError,
  NotLiquidatableError,
  ProtocolPausedError,
  InsufficientBalanceError,
} from '../src';

describe('Custom Error Classes', () => {
  describe('BitflowSDKError', () => {
    it('should be instanceof Error', () => {
      const error = new BitflowSDKError('test');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(BitflowSDKError);
    });

    it('should have correct name', () => {
      const error = new BitflowSDKError('test');
      expect(error.name).toBe('BitflowSDKError');
    });

    it('should preserve message', () => {
      const error = new BitflowSDKError('custom message');
      expect(error.message).toBe('custom message');
    });

    it('should have stack trace', () => {
      const error = new BitflowSDKError('test');
      expect(error.stack).toBeDefined();
    });
  });

  describe('InvalidAddressError', () => {
    it('should extend BitflowSDKError', () => {
      const error = new InvalidAddressError();
      expect(error).toBeInstanceOf(BitflowSDKError);
    });

    it('should have default message', () => {
      const error = new InvalidAddressError();
      expect(error.message).toBe('Invalid Stacks address');
    });

    it('should accept custom message', () => {
      const error = new InvalidAddressError('Custom address error');
      expect(error.message).toBe('Custom address error');
    });
  });

  describe('InvalidAmountError', () => {
    it('should extend BitflowSDKError', () => {
      const error = new InvalidAmountError('test');
      expect(error).toBeInstanceOf(BitflowSDKError);
    });

    it('should store minimumRequired', () => {
      const error = new InvalidAmountError('test', 1000n);
      expect(error.minimumRequired).toBe(1000n);
    });

    it('should store actual', () => {
      const error = new InvalidAmountError('test', 1000n, 500n);
      expect(error.actual).toBe(500n);
    });

    it('should have undefined for optional fields if not provided', () => {
      const error = new InvalidAmountError('test');
      expect(error.minimumRequired).toBeUndefined();
      expect(error.actual).toBeUndefined();
    });
  });

  describe('InsufficientCollateralError', () => {
    it('should extend BitflowSDKError', () => {
      const error = new InsufficientCollateralError('test', 1000n, 500n);
      expect(error).toBeInstanceOf(BitflowSDKError);
    });

    it('should store required and actual amounts', () => {
      const error = new InsufficientCollateralError('Need more', 1500n, 1000n);
      expect(error.required).toBe(1500n);
      expect(error.actual).toBe(1000n);
    });
  });

  describe('TransactionFailedError', () => {
    it('should extend BitflowSDKError', () => {
      const error = new TransactionFailedError('test');
      expect(error).toBeInstanceOf(BitflowSDKError);
    });

    it('should store contractErrorCode', () => {
      const error = new TransactionFailedError('test', 100n);
      expect(error.contractErrorCode).toBe(100n);
    });

    it('should store txId', () => {
      const error = new TransactionFailedError('test', undefined, 'abc123');
      expect(error.txId).toBe('abc123');
    });

    it('should store both errorCode and txId', () => {
      const error = new TransactionFailedError('Fail', 200n, 'tx456');
      expect(error.contractErrorCode).toBe(200n);
      expect(error.txId).toBe('tx456');
    });
  });

  describe('NetworkError', () => {
    it('should extend BitflowSDKError', () => {
      const error = new NetworkError('Connection failed');
      expect(error).toBeInstanceOf(BitflowSDKError);
      expect(error.message).toBe('Connection failed');
    });
  });

  describe('Specific Error Types', () => {
    const errorTypes = [
      { Class: UnauthorizedError, defaultMessage: 'Unauthorized operation' },
      { Class: LoanActiveError, defaultMessage: 'Active loan already exists' },
      { Class: NoLoanError, defaultMessage: 'No active loan found' },
      { Class: NotLiquidatableError, defaultMessage: 'Position is not liquidatable' },
      { Class: ProtocolPausedError, defaultMessage: 'Protocol is currently paused' },
      { Class: InsufficientBalanceError, defaultMessage: 'Insufficient balance' },
    ];

    errorTypes.forEach(({ Class, defaultMessage }) => {
      describe(Class.name, () => {
        it('should extend BitflowSDKError', () => {
          const error = new Class();
          expect(error).toBeInstanceOf(BitflowSDKError);
        });

        it('should have default message', () => {
          const error = new Class();
          expect(error.message).toBe(defaultMessage);
        });

        it('should accept custom message', () => {
          const error = new Class('Custom message');
          expect(error.message).toBe('Custom message');
        });

        it('should have correct name', () => {
          const error = new Class();
          expect(error.name).toBe(Class.name);
        });
      });
    });
  });

  describe('Error instanceof checks', () => {
    it('should allow instanceof checks for error handling', () => {
      const errors = [
        new InvalidAddressError(),
        new InvalidAmountError('test'),
        new InvalidParameterError('test'),
        new InsufficientCollateralError('test', 0n, 0n),
        new TransactionFailedError('test'),
        new NetworkError('test'),
        new UnauthorizedError(),
        new LoanActiveError(),
        new NoLoanError(),
        new NotLiquidatableError(),
        new ProtocolPausedError(),
        new InsufficientBalanceError(),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(BitflowSDKError);
        expect(error).toBeInstanceOf(Error);
      });
    });

    it('should differentiate between error types', () => {
      const addressError = new InvalidAddressError();
      const amountError = new InvalidAmountError('test');

      expect(addressError).toBeInstanceOf(InvalidAddressError);
      expect(addressError).not.toBeInstanceOf(InvalidAmountError);

      expect(amountError).toBeInstanceOf(InvalidAmountError);
      expect(amountError).not.toBeInstanceOf(InvalidAddressError);
    });
  });
});
