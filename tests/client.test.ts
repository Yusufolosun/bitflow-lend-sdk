import { describe, it, expect } from 'vitest';
import {
  VaultClient,
  CONTRACT_ADDRESSES,
  getContractAddress,
  InvalidAddressError,
} from '../src';

describe('VaultClient', () => {
  describe('initialization', () => {
    it('should initialize with mainnet', () => {
      const client = new VaultClient({ network: 'mainnet' });
      expect(client.getNetwork()).toBe('mainnet');
      expect(client.getContractAddress()).toBe(
        'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.bitflow-vault-core-v2'
      );
    });

    it('should initialize with testnet', () => {
      const client = new VaultClient({ network: 'testnet' });
      expect(client.getNetwork()).toBe('testnet');
      expect(client.getContractAddress()).toBe(
        'ST1N3809W9CBWWX04KN3TCQHP8A9GN520BDRPWBVD.bitflow-vault-core-v2'
      );
    });

    it('should reject invalid address in getRepaymentAmount', async () => {
      const client = new VaultClient({ network: 'mainnet' });

      await expect(client.getRepaymentAmount('invalid-address')).rejects.toBeInstanceOf(
        InvalidAddressError
      );
    });
  });
});

describe('Contract Addresses', () => {
  it('should have mainnet addresses', () => {
    expect(CONTRACT_ADDRESSES.mainnet.vaultCore).toContain('SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z');
    expect(CONTRACT_ADDRESSES.mainnet.vaultCore).toContain('bitflow-vault-core-v2');
  });

  it('should have testnet addresses', () => {
    expect(CONTRACT_ADDRESSES.testnet.vaultCore).toContain('ST1N3809W9CBWWX04KN3TCQHP8A9GN520BDRPWBVD');
    expect(CONTRACT_ADDRESSES.testnet.vaultCore).toContain('bitflow-vault-core-v2');
  });

  it('should get contract addresses by network', () => {
    const mainnetVault = getContractAddress('vaultCore', 'mainnet');
    const testnetVault = getContractAddress('vaultCore', 'testnet');

    expect(mainnetVault).toContain('SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z');
    expect(testnetVault).toContain('ST1N3809W9CBWWX04KN3TCQHP8A9GN520BDRPWBVD');
  });
});
