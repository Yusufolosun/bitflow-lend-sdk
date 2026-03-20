/**
 * Calculate time remaining in blocks
 */
export function calculateBlocksRemaining(
  currentBlock: bigint,
  endBlock: bigint
): bigint {
  return endBlock > currentBlock ? endBlock - currentBlock : 0n;
}

/**
 * Estimate time from blocks (assumes 10 min per block)
 */
export function blocksToTime(blocks: bigint): {
  days: number;
  hours: number;
  minutes: number;
} {
  const totalMinutes = Number(blocks) * 10;
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

/**
 * Format blocks to human readable time
 */
export function formatBlocksToTime(blocks: bigint): string {
  const { days, hours, minutes } = blocksToTime(blocks);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
