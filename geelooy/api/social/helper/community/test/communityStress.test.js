//B"H
const assert = require('assert');
const { createReview, approveReview, listReview } = require('../reviewEngine.js');
const notes = require('../../notifications.js');
function makeDb() {
  const store = new Map();
  return {
    store,
    async write(path, value) { store.set(path, value); return { path, value }; },
    async get(path) {
      if (store.has(path)) return store.get(path);
      const prefix = path.endsWith('/') ? path : path + '/';
      const out = {};
      for (const [key, value] of store.entries()) {
        if (!key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length);
        if (rest && !rest.includes('/')) out[rest] = value;
      }
      return Object.keys(out).length ? out : undefined;
    }
  };
}
(async () => {
  const $i = { db: makeDb(), async fetchAwtsmoos() { return {}; } };
  const verify = async ({ aliasId }) => aliasId === 'mod';
  for (let i = 0; i < 2500; i++) await createReview({ $i, heichelId: 'stress', aliasId: 'u' + i, contentType: i % 3 ? 'post' : 'comment', payload: { id: 'r' + i, title: 'item ' + i }, verifyHeichelAuthority: verify });
  const page = await listReview({ $i, heichelId: 'stress', limit: 100, offset: 2400, search: 'item' });
  assert.equal(page.success.items.length, 100);
  const approvals = await Promise.all([0, 1, 2, 3, 4].map(() => approveReview({ $i, heichelId: 'stress', reviewId: 'r1', aliasId: 'mod', verifyHeichelAuthority: verify })));
  assert.equal(approvals.filter(x => x.success).length, 1);
  assert.equal(approvals.filter(x => x.error?.code === 'ALREADY_REVIEWED').length, 4);
  for (let i = 0; i < 1200; i++) await notes.createNotification({ $i, toAliasId: 'keeper', type: i % 2 ? 'comment' : 'submission_created', title: 'note ' + i, body: 'body ' + i });
  const listed = await notes.listNotifications({ $i, aliasId: 'keeper', limit: 75, offset: 1125, search: 'note' });
  assert.equal(listed.success.items.length, 75);
  assert.equal(listed.success.total, 1200);
  console.log('B"H communityStress.test passed');
})().catch(error => { console.error(error); process.exit(1); });
