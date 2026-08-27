//B"H
const assert = require('assert');
const buildIndexRoutes = require('../routes/indexing.js');

const store = {
  '/social/aliases/authorA/comments/heichel': {
    heichelOne: true,
    heichelTwo: true
  },
  '/social/aliases/authorA/comments/heichel/heichelOne/seriesChain': {
    root: {
      inner: {
        seriesId: 'inner',
        breadcrumb: 'root/inner',
        updatedAt: 123
      }
    }
  }
};

const $i = {
  db: {
    async get(path) {
      return store[path] || null;
    }
  },
  $_POST: {}
};

(async () => {
  const routes = buildIndexRoutes({ $i, userid: 'userA' });

  const heichelos = await routes['/aliases/:alias/commentsMade/heichelos']({ alias: 'authorA' });
  assert.deepStrictEqual(heichelos.success.map(x => x.id).sort(), ['heichelOne', 'heichelTwo']);

  const series = await routes['/aliases/:alias/commentsMade/heichel/:heichel/series']({
    alias: 'authorA',
    heichel: 'heichelOne'
  });
  assert.equal(series.success.length, 1);
  assert.equal(series.success[0].seriesId, 'inner');
  assert.equal(series.success[0].breadcrumb, 'root/inner');

  console.log('B"H commentIndexingRoute.test passed');
})().catch(error => {
  console.error(error);
  process.exit(1);
});
