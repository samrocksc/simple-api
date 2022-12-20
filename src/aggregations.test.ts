import { sample } from './sample.data';
import {
  dedupByKey,
  extractTransactionsByCustomerId,
  extractTransactionsByTransactionId,
  mapRelatedTransactions,
  mapTransactionTimeline,
  mapUniqueTransactions,
  mapUsersTransactions,
} from './aggregations';

describe('extractTransactionsByCustomerId', () => {
  it('should return array of results for only the customerId Supplied', () => {
    const result = extractTransactionsByCustomerId(1, sample);
    expect(result).toHaveLength(8);
    expect(result[0].customerId).toBe(1);
    expect(result[7].customerId).toBe(1);
  });

  it('should return an empty array for a customerId that does not exist', () => {
    const result = extractTransactionsByCustomerId(99, sample);
    expect(result).toHaveLength(0);
  });
});

describe('mapUniqueTransactions', () => {
  it('should return the proper amount of transactions', () => {
    const data = extractTransactionsByCustomerId(1, sample);
    const result = mapUniqueTransactions(data);
    expect(result).toHaveLength(8);
  });
});

describe('mapTransactionTimeline', () => {
  it('should create an accurate timeline of transactions from a list', () => {
    const customerTransactions = extractTransactionsByCustomerId(1, sample);
    const uniqueTransactions = mapUniqueTransactions(customerTransactions);
    const transactionsForId = extractTransactionsByTransactionId(
      uniqueTransactions[0],
      customerTransactions
    );
    const result = mapTransactionTimeline(transactionsForId);
    expect(result.timeline).toHaveLength(2);
  });

  it('should show status "SETTLED" before "PENDING" in the timeline', () => {
    const customerTransactions = extractTransactionsByCustomerId(1, sample);
    const uniqueTransactions = mapUniqueTransactions(customerTransactions);
    const transactionsForId = extractTransactionsByTransactionId(
      uniqueTransactions[0],
      customerTransactions
    );
    const result = mapTransactionTimeline(transactionsForId);
    expect(result.timeline[0].status).toBe('SETTLED');
  });
});

describe('dedupByKey', () => {
  const dataSet = [
    { id: 1, reason: 'duplicated' },
    { id: 2, reason: 'duplicated' },
    { id: 3, reason: 'significant' },
  ];

  it('should return a length of two', () => {
    const result = dedupByKey('reason', dataSet);
    expect(result).toHaveLength(2);
  });

  it('should return length of two if each reason is different', () => {
    const result = dedupByKey(
      'reason',
      dataSet.filter((datum) => datum.id !== 1)
    );
    expect(result).toHaveLength(2);
  });
});

describe('mapUsersTransactions', () => {
  it('should properly map a users transactions', () => {
    const result = mapUsersTransactions(1, sample);
    expect(result).toHaveLength(4);
    expect(result[0].timeline).toHaveLength(2);
    expect(result[1].timeline).toHaveLength(2);
  });

  it.only('should only return unique authorization codes', () => {
    const result = mapUsersTransactions(3, sample);
    expect(result).toHaveLength(3);
    expect(result[0].authorizationCode).not.toBe(result[1].authorizationCode);
  });
});

describe('mapUsersRelations', () => {
  it('should return empty array if no relations are found', () => {
    const userOneTransactions = mapUsersTransactions(1, sample);
    const relations = mapRelatedTransactions(userOneTransactions, sample);
    expect(relations).toHaveLength(0);
  });

  it('should return an array if relations are found', () => {
    const userOneTransactions = mapUsersTransactions(5, sample);
    const relations = mapRelatedTransactions(userOneTransactions, sample);
    expect(relations).toHaveLength(7);
  });
});
