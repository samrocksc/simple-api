import { sample } from './sample.data';
import {
  extractTransactionsByCustomerId,
  extractTransactionsByTransactionId,
  mapRelatedTransactions,
  mapTransactionTimeline,
  mapUniqueTransactions,
  mapUsersTransactions,
} from './aggregateById';

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
});

describe('mapUsersTransactions', () => {
  it('should properly map a users transactions', () => {
    const result = mapUsersTransactions(1, sample);
    expect(result).toHaveLength(8);
    expect(result[0].timeline).toHaveLength(2);
    expect(result[1].timeline).toHaveLength(1);
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
    expect(relations).toHaveLength(3);
  });
});
