import type { ClarityValue } from '@stacks/transactions';
import { cvToValue } from '@stacks/transactions';

/**
 * Safely convert Clarity value to JavaScript value
 */
export function safeCvToValue<T>(cv: ClarityValue): T | null {
  try {
    return cvToValue(cv) as T;
  } catch {
    return null;
  }
}
