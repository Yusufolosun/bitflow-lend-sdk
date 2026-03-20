/**
 * Validate STX address format
 */
export function isValidStxAddress(address: string): boolean {
  // Mainnet starts with SP, testnet with ST
  return /^(SP|ST)[0-9A-Z]{38,41}$/.test(address);
}

/**
 * Validate contract identifier format
 */
export function isValidContractId(contractId: string): boolean {
  const parts = contractId.split('.');
  return parts.length === 2 && isValidStxAddress(parts[0]) && parts[1].length > 0;
}
