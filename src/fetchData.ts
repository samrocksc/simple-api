import fetch from 'cross-fetch';

import { Transaction } from './types';

export const fetchData = async () => {
  const response = await fetch(
    'https://cdn.sablecard.com/challenge/transactions-v2.json'
  );
  if (response.ok) {
    return response.json() as unknown as Transaction[];
  }
  throw Error('Could not retrieve data at this time');
};
