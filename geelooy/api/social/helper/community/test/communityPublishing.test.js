//B"H
const assert = require('assert');
const settings = require('../communitySettings.js');
const permissions = require('../permissionEngine.js');
const review = require('../reviewEngine.js');
const { STATUS } = require('../statuses.js');
const events = require('../eventBus.js');
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
  const $i = { db: makeDb() };
  const verify = async ({ aliasId }) => aliasId === 'mod';
  const defaults = await settings.getCommunitySettings({ $i, heichelId: 'h1' });
  assert.equal(defaults.allowPublicSubmissions, true);
  assert.equal(defaults.requireModeratorApproval, true);
  assert.equal(await permissions.canSubmit({ $i, heichelId: 'h1', aliasId: 'writer', contentType: 'post', verifyHeichelAuthority: verify }), true);
  assert.equal(await permissions.canApprove({ $i, heichelId: 'h1', aliasId: 'writer', verifyHeichelAuthority: verify }), false);
  await settings.updateCommunitySettings({ $i, heichelId: 'h1', patch: { allowQuestions: false } });
  assert.equal(await permissions.canSubmit({ $i, heichelId: 'h1', aliasId: 'writer', contentType: 'question', verifyHeichelAuthority: verify }), false);
  await settings.updateCommunitySettings({ $i, heichelId: 'h1', patch: { allowQuestions: true } });
  const seen = [];
  events.clearListeners();
  events.on('*', event => seen.push(event.type));
  const made = await review.createReview({ $i, heichelId: 'h1', aliasId: 'writer', contentType: 'post', payload: { id: 'r1', title: 'Open gate' }, verifyHeichelAuthority: verify });
  assert.equal(made.success.status, STATUS.PENDING);
  const queue = await review.listReview({ $i, heichelId: 'h1', search: 'Open gate' });
  assert.equal(queue.success.total, 1);
  const approved = await review.approveReview({ $i, heichelId: 'h1', reviewId: 'r1', aliasId: 'mod', verifyHeichelAuthority: verify });
  assert.equal(approved.success.status, STATUS.APPROVED);
  const second = await review.approveReview({ $i, heichelId: 'h1', reviewId: 'r1', aliasId: 'mod', verifyHeichelAuthority: verify });
  assert.equal(second.error.code, 'ALREADY_REVIEWED');
  assert.deepEqual(seen, ['SubmissionCreated', 'SubmissionApproved']);
  for (let i = 0; i < 1000; i++) await review.createReview({ $i, heichelId: 'h2', aliasId: 'u' + i, contentType: i % 2 ? 'comment' : 'post', payload: { id: 'stress' + i, title: 'stress ' + i }, verifyHeichelAuthority: verify });
  const page = await review.listReview({ $i, heichelId: 'h2', limit: 25, offset: 50 });
  assert.equal(page.success.items.length, 25);
  assert.equal(page.success.total, 1000);
  console.log('B"H communityPublishing.test passed');
})().catch(error => { console.error(error); process.exit(1); });
