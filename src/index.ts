import Koa from 'koa';
import Router from '@koa/router';
import { fetchData } from './fetchData';
import { mapRelatedTransactions, mapUsersTransactions } from './aggregateById';

export const main = () => {
  const app = new Koa();
  const router = new Router();
  router.get(
    '/users-transactions/:customerId',
    async ({ params, response }) => {
      if (!params.customerId) {
        return null;
      }
      const data = await fetchData();
      const result = mapUsersTransactions(
        parseInt(params.customerId, 10),
        data
      );
      response.body = result;
    }
  );

  router.get('/users-relations/:customerId', async ({ params, response }) => {
    if (!params.customerId) {
      return null;
    }
    const data = await fetchData();
    const usersTransactions = mapUsersTransactions(
      parseInt(params.customerId, 10),
      data
    );
    const relations = mapRelatedTransactions(usersTransactions, data);
    response.body = relations;
  });

  app.use(router.routes());
  const server = app.listen(3000, () => console.info('Server Started'));
  return server;
};

main();
