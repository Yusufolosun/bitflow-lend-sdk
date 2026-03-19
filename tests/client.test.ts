import { describe, it, expect } from 'vitest';
import { VaultClient, CONTRACT_ADDRESSES, getContractAddress } from '../src';

describe('VaultClient', () => {
  describe('initialization', () => {
    it('should initialize with mainnet', () => {
      const client = new VaultClient({ network: 'mainnet' });
      expect(client.getNetwork()).toBe('mainnet');
      expect(client.getContractAddress()).toBe(
        'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.bitflow-vault-core'
      );
    });

    it('should initialize with testnet', () => {
      const client = new VaultClient({ network: 'testnet' });
      expect(client.getNetwork()).toBe('testnet');
      expect(client.getContractAddress()).toBe(
        'ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0.bitflow-vault-core'
      );
    });
  });
});

describe('Contract Addresses', () => {
  it('should have mainnet addresses', () => {
    expect(CONTRACT_ADDRESSES.mainnet.vaultCore).toContain('SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193');
    expect(CONTRACT_ADDRESSES.mainnet.stakingPool).toContain('SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193');
    expect(CONTRACT_ADDRESSES.mainnet.oracleRegistry).toContain('SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193');
  });

  it('should have testnet addresses', () => {
    expect(CONTRACT_ADDRESSES.testnet.vaultCore).toContain('ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0');
    expect(CONTRACT_ADDRESSES.testnet.stakingPool).toContain('ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0');
    expect(CONTRACT_ADDRESSES.testnet.oracleRegistry).toContain('ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0');
  });

  it('should get contract addresses by network', () => {
    const mainnetVault = getContractAddress('vaultCore', 'mainnet');
    const testnetVault = getContractAddress('vaultCore', 'testnet');
    
    expect(mainnetVault).toContain('SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193');
    expect(testnetVault).toContain('ST1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK1GA0CF0');
  });
});
