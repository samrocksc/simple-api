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
  readonly amount: number;
};

export type EnrichedTransaction = Transaction & {
  timeline: TransactionTimelineItem[];
  updatedAt: Date;
};

/**
 * maps over customer transactions and generates timeline
 */
export const mapTransactionTimeline = (transactions: Transaction[]) => {
  const timeline = transactions.reduce(
    (acc: TransactionTimelineItem[], cur) => [
      ...acc,
      {
        status: cur.transactionStatus,
        createdAt: new Date(cur.transactionDate),
        amount: cur.amount,
      },
    ],
    []
  );

  const sortedTimeline = timeline.sort((a, b) =>
    a.createdAt.toString().localeCompare(b.createdAt.toString())
  );

  return {
    ...transactions[0],
    createdAt: transactions[0].transactionDate,
    updatedAt: timeline[0].createdAt,
    timeline: sortedTimeline,
  };
};

/**
 * A typesafe way to dedup an array based off of an key
 */
export const dedupByKey = <D>(key: keyof D, data: D[]) =>
  data.reduce((uniques, cur) => {
    if (!uniques.some((item) => item[key] === cur[key])) {
      return [...uniques, cur];
    }
    return uniques;
  }, [] as typeof data);

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

  const uniqueTimelines = dedupByKey('authorizationCode', enrichedTimelines);
  return uniqueTimelines;
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

      const deviceRelations =
        (metadata.deviceId &&
          extractTransactionsByDeviceId(metadata.deviceId, transactions).map(
            (transaction) => ({
              relationType: 'DEVICE',
              relatedCustomerId: transaction.customerId,
            })
          )) ||
        [];

      const transactionRelation = metadata.relatedTransactionId &&
        relatableStatuses.includes(transaction.transactionType) && {
          relationType: transactionType,
          relatedCustomerId: extractTransactionsByTransactionId(
            metadata.relatedTransactionId,
            transactions
          )[0].customerId,
        };

      return [...deviceRelations, transactionRelation];
    })
    .filter(Boolean);

  const relations = [...new Set(mapped)];
  return relations;
};
