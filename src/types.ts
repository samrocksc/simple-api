export type Transaction = {
  readonly transactionId: number;
  readonly authorizationCode: string;
  readonly transactionDate: string;
  readonly customerId: number;
  readonly transactionType: string;
  readonly transactionStatus: TransactionStatus;
  readonly description: string;
  readonly amount: number;
  readonly metadata: Metadata;
};

export type Metadata = {
  readonly relatedTransactionId?: number;
  readonly deviceId?: string;
};

export type TransactionStatus = 'PENDING' | 'RETURNED' | 'SETTLED';
