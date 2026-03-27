import { beforeEach, describe, expect, it, vi } from 'vitest';

const { makeContractCallMock, broadcastTransactionMock } = vi.hoisted(() => ({
  makeContractCallMock: vi.fn(async (txOptions: unknown) => txOptions),
  broadcastTransactionMock: vi.fn(async () => ({ txid: '0xtesttxid' })),
}));

vi.mock('@stacks/transactions', () => ({
  fetchCallReadOnlyFunction: vi.fn(),
  makeContractCall: makeContractCallMock,
  broadcastTransaction: broadcastTransactionMock,
  AnchorMode: { Any: 3 },
  PostConditionMode: { Allow: 1 },
  uintCV: (value: bigint) => ({ type: 'uint', value }),
  principalCV: (value: string) => ({ type: 'principal', value }),
}));

vi.mock('@stacks/network', () => ({
  STACKS_MAINNET: { chainId: 1 },
  STACKS_TESTNET: { chainId: 2147483648 },
}));

import { VaultClient } from '../src';

describe('VaultClient transaction options', () => {
  beforeEach(() => {
    makeContractCallMock.mockClear();
    broadcastTransactionMock.mockClear();
  });

  it('preserves explicit 0n fee and nonce values', async () => {
    const client = new VaultClient({ network: 'testnet' });

    await client.deposit(1_000_000n, 'a'.repeat(64), {
      fee: 0n,
      nonce: 0n,
    });

    expect(makeContractCallMock).toHaveBeenCalledTimes(1);

    const txOptions = makeContractCallMock.mock.calls[0][0] as {
      fee: bigint;
      nonce?: bigint;
    };

    expect(txOptions.fee).toBe(0n);
    expect(txOptions.nonce).toBe(0n);
  });
});
