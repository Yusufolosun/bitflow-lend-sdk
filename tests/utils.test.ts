import { describe, it, expect } from 'vitest';
import {
  formatStx,
  toMicroStx,
  formatInterestRate,
  formatHealthFactor,
  isValidStxAddress,
  isValidContractId,
  calculateRequiredCollateral,
  calculateMaxBorrow,
  calculateInterest,
  blocksToTime,
  formatBlocksToTime,
  PROTOCOL_CONSTANTS,
} from '../src';

describe('Utility Functions', () => {
  describe('formatStx', () => {
    it('should format micro-STX to STX', () => {
      expect(formatStx(1000000n)).toBe('1.00');
      expect(formatStx(1500000000n)).toBe('1,500.00');
      expect(formatStx(123456789n)).toBe('123.456789');
    });
  });

  describe('toMicroStx', () => {
    it('should convert STX to micro-STX', () => {
      expect(toMicroStx(1)).toBe(1000000n);
      expect(toMicroStx(1500)).toBe(1500000000n);
      expect(toMicroStx(0.5)).toBe(500000n);
    });
  });

  describe('formatInterestRate', () => {
    it('should format basis points to percentage', () => {
      expect(formatInterestRate(500n)).toBe('5.00%');
      expect(formatInterestRate(1000n)).toBe('10.00%');
      expect(formatInterestRate(50n)).toBe('0.50%');
    });
  });

  describe('formatHealthFactor', () => {
    it('should format health factor as percentage', () => {
      expect(formatHealthFactor(15000n)).toBe('150.00%');
      expect(formatHealthFactor(11000n)).toBe('110.00%');
      expect(formatHealthFactor(10000n)).toBe('100.00%');
    });
  });

  describe('isValidStxAddress', () => {
    it('should validate mainnet addresses', () => {
      expect(isValidStxAddress('SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193')).toBe(true);
    });

    it('should validate testnet addresses', () => {
      expect(isValidStxAddress('ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0')).toBe(true);
    });

    it('should reject invalid addresses', () => {
      expect(isValidStxAddress('invalid')).toBe(false);
      expect(isValidStxAddress('SP123')).toBe(false);
    });
  });

  describe('isValidContractId', () => {
    it('should validate contract identifiers', () => {
      expect(isValidContractId('SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.vault-core')).toBe(true);
    });

    it('should reject invalid contract identifiers', () => {
      expect(isValidContractId('invalid')).toBe(false);
      expect(isValidContractId('SP123.test')).toBe(false);
    });
  });

  describe('calculateRequiredCollateral', () => {
    it('should calculate 150% collateral requirement', () => {
      const loan = toMicroStx(1000);
      const collateral = calculateRequiredCollateral(loan);
      expect(collateral).toBe(toMicroStx(1500));
    });

    it('should handle custom collateral ratios', () => {
      const loan = toMicroStx(1000);
      const collateral = calculateRequiredCollateral(loan, 20000n); // 200%
      expect(collateral).toBe(toMicroStx(2000));
    });
  });

  describe('calculateMaxBorrow', () => {
    it('should calculate max borrow from collateral', () => {
      const collateral = toMicroStx(1500);
      const maxLoan = calculateMaxBorrow(collateral);
      expect(maxLoan).toBe(toMicroStx(1000));
    });

    it('should handle custom collateral ratios', () => {
      const collateral = toMicroStx(2000);
      const maxLoan = calculateMaxBorrow(collateral, 20000n); // 200%
      expect(maxLoan).toBe(toMicroStx(1000));
    });
  });

  describe('calculateInterest', () => {
    it('should calculate simple interest correctly', () => {
      const principal = toMicroStx(1000);
      const rate = 500n; // 5%
      const blocks = 52560n; // 1 year

      const interest = calculateInterest(principal, rate, blocks);
      expect(interest).toBe(toMicroStx(50)); // 5% of 1000
    });

    it('should calculate proportional interest for partial terms', () => {
      const principal = toMicroStx(1000);
      const rate = 500n; // 5%
      const blocks = 26280n; // 6 months

      const interest = calculateInterest(principal, rate, blocks);
      expect(interest).toBe(toMicroStx(25)); // 2.5% of 1000
    });
  });

  describe('blocksToTime', () => {
    it('should convert blocks to time', () => {
      const time = blocksToTime(7200n); // 50 days
      expect(time.days).toBe(50);
      expect(time.hours).toBe(0);
      expect(time.minutes).toBe(0);
    });

    it('should handle partial days', () => {
      const time = blocksToTime(150n); // ~1 day and 1 hour
      expect(time.days).toBe(1);
      expect(time.hours).toBe(1);
      expect(time.minutes).toBe(0);
    });
  });

  describe('formatBlocksToTime', () => {
    it('should format blocks as human-readable time', () => {
      expect(formatBlocksToTime(7200n)).toBe('50d 0h');
      expect(formatBlocksToTime(144n)).toBe('1d 0h');
      expect(formatBlocksToTime(60n)).toBe('10h 0m');
      expect(formatBlocksToTime(6n)).toBe('1h 0m');
    });
  });
});

describe('Constants', () => {
  it('should have correct protocol constants', () => {
    expect(PROTOCOL_CONSTANTS.COLLATERAL_RATIO).toBe(15000n);
    expect(PROTOCOL_CONSTANTS.LIQUIDATION_THRESHOLD).toBe(11000n);
    expect(PROTOCOL_CONSTANTS.BLOCKS_PER_YEAR).toBe(52560n);
    expect(PROTOCOL_CONSTANTS.BLOCKS_PER_DAY).toBe(144n);
  });
});
