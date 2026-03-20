/**
 * Base error class for all BitFlow SDK errors
 */
export class BitflowSDKError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Invalid Stacks address error
 */
export class InvalidAddressError extends BitflowSDKError {
  constructor(message: string = 'Invalid Stacks address') {
    super(message);
  }
}

/**
 * Invalid amount error
 */
export class InvalidAmountError extends BitflowSDKError {
  constructor(
    message: string,
    public readonly minimumRequired?: bigint,
    public readonly actual?: bigint
  ) {
    super(message);
  }
}

/**
 * Invalid parameter error
 */
export class InvalidParameterError extends BitflowSDKError {}

/**
 * Insufficient collateral error
 */
export class InsufficientCollateralError extends BitflowSDKError {
  constructor(
    message: string,
    public readonly required: bigint,
    public readonly actual: bigint
  ) {
    super(message);
  }
}

/**
 * Transaction failed error
 */
export class TransactionFailedError extends BitflowSDKError {
  constructor(
    message: string,
    public readonly contractErrorCode?: bigint,
    public readonly txId?: string
  ) {
    super(message);
  }
}

/**
 * Network error
 */
export class NetworkError extends BitflowSDKError {}

/**
 * Unauthorized operation error
 */
export class UnauthorizedError extends BitflowSDKError {
  constructor(message: string = 'Unauthorized operation') {
    super(message);
  }
}

/**
 * Active loan already exists error
 */
export class LoanActiveError extends BitflowSDKError {
  constructor(message: string = 'Active loan already exists') {
    super(message);
  }
}

/**
 * No active loan found error
 */
export class NoLoanError extends BitflowSDKError {
  constructor(message: string = 'No active loan found') {
    super(message);
  }
}

/**
 * Position not liquidatable error
 */
export class NotLiquidatableError extends BitflowSDKError {
  constructor(message: string = 'Position is not liquidatable') {
    super(message);
  }
}

/**
 * Protocol paused error
 */
export class ProtocolPausedError extends BitflowSDKError {
  constructor(message: string = 'Protocol is currently paused') {
    super(message);
  }
}

/**
 * Insufficient balance error
 */
export class InsufficientBalanceError extends BitflowSDKError {
  constructor(message: string = 'Insufficient balance') {
    super(message);
  }
}
