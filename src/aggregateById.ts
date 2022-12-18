import { Transaction, TransactionStatus } from './types';

/**
 * Extracts the transactions by customerId
 */
export const extractTransactionsByCustomerId = (
  customerId: number,
  transactions: Transaction[]
) =>
  transactions.filter((transaction) => transaction.customerId === customerId);

/**
 * Extracts transactions by the transactionId
 */
export const extractTransactionsByTransactionId = (
  transactionId: number,
  transactions: Transaction[]
) =>
  transactions.filter(
    (transaction) =>
      transaction.transactionId === transactionId ||
      transaction.metadata.relatedTransactionId === transactionId
  );

/**
 * Extract all transactions by deviceId
 */
export const extractTransactionsByDeviceId = (
  deviceId: string,
  transactions: Transaction[]
) =>
  transactions.filter(
    (transaction) => transaction.metadata.deviceId === deviceId
  );

/**
 * Extracts unique transactions
 */
export const mapUniqueTransactions = (transactions: Transaction[]) => [
  ...new Set(transactions.map((transaction) => transaction.transactionId)),
];

export type TransactionTimelineItem = {
  readonly createdAt: Date;
  readonly status: TransactionStatus;
  readonly amount: Number;
};

export type EnrichedTransaction = Transaction & {
  timeline: TransactionTimelineItem[];
};

/**
 * maps over customer transactions and generates timeline
 */
export const mapTransactionTimeline = (transactions: Transaction[]) => {
  return transactions.reduce(
    (acc: EnrichedTransaction, cur) => {
      const data = {
        ...acc,
        timeline: [
          ...acc.timeline,
          {
            status: cur.transactionStatus,
            createdAt: new Date(cur.transactionDate),
            amount: cur.amount,
          },
        ],
      };
      return data;
    },
    {
      ...transactions[0],
      timeline: [],
    }
  );
};

/**
 * Combines each transaction ID into an array with its statuses and amounts
 */
export const mapUsersTransactions = (
  customerId: number,
  transactions: Transaction[]
) => {
  const customerTransactions = extractTransactionsByCustomerId(
    customerId,
    transactions
  );
  const uniqueTransactionIds = mapUniqueTransactions(customerTransactions);
  const mappedTimelines = uniqueTransactionIds.map((transactionId) =>
    extractTransactionsByTransactionId(transactionId, customerTransactions)
  );
  const enrichedTimelines = mappedTimelines.map((timeline) =>
    mapTransactionTimeline(timeline)
  );
  return enrichedTimelines;
};

/**
 * Statuses that indicate that a relation is shared with another user within the system
 */
export const relatableStatuses = ['P2P_RECEIVE', 'P2P_SEND'];

/**
 * Maps each of the user's transactions to its related user
 */
export const mapRelatedTransactions = (
  usersTransactions: Transaction[],
  transactions: Transaction[]
) => {
  const mapped = usersTransactions
    .flatMap((transaction) => {
      const { metadata, transactionType } = transaction;

      const deviceRelation = !metadata.relatedTransactionId &&
        metadata.deviceId && {
          relationType: 'DEVICE',
          relatedCustomerId: extractTransactionsByDeviceId(
            metadata.deviceId,
            transactions
          )[0].customerId,
        };

      const transactionRelation = metadata.relatedTransactionId &&
        relatableStatuses.includes(transaction.transactionType) && {
          relationType: transactionType,
          relatedCustomerId: extractTransactionsByTransactionId(
            metadata.relatedTransactionId,
            transactions
          )[0].customerId,
        };

      return [deviceRelation, transactionRelation];
    })
    .filter(Boolean);

  const relations = [...new Set(mapped)];
  return relations;
};
