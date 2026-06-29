//B"H
const assert = require('assert');
const { createReview, approveReview, rejectReview, listReview } = require('../reviewEngine.js');
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
async function seedReviews($i, verify) {
  for (let i = 0; i < 7000; i++) await createReview({
    $i, heichelId: 'stress', aliasId: 'u' + i,
    contentType: i % 5 === 0 ? 'comment' : i % 3 === 0 ? 'question' : 'post',
    payload: { id: 'r' + i, title: 'item ' + i, body: 'visible body ' + i, summary: 'summary ' + i, private: 'sealed-' + i },
    verifyHeichelAuthority: verify
  });
}
async function seedNotes($i) {
  for (let i = 0; i < 3500; i++) await notes.createNotification({
    $i, toAliasId: 'keeper', type: i % 2 ? 'comment' : 'submission_created', title: 'note ' + i, body: 'body ' + i,
    entity: { id: 'entity-' + i, title: 'entity title ' + i, private: 'note-sealed-' + i }
  });
}
(async () => {
  const $i = { db: makeDb(), async fetchAwtsmoos() { return {}; } };
  const verify = async ({ aliasId }) => aliasId === 'mod';
  await seedReviews($i, verify);
  const clamped = await listReview({ $i, heichelId: 'stress', limit: 9999, offset: -500, search: 'item' });
  assert.equal(clamped.success.limit, 100);
  assert.equal(clamped.success.offset, 0);
  assert.equal(clamped.success.items.length, 100);
  assert.equal(clamped.success.total, 7000);
  const tail = await listReview({ $i, heichelId: 'stress', limit: 100, offset: 6900, search: 'item' });
  assert.equal(tail.success.items.length, 100);
  assert.equal(tail.success.hasMore, false);
  const posts = await listReview({ $i, heichelId: 'stress', status: 'all', contentType: 'post', limit: 500 });
  assert.equal(posts.success.limit, 100);
  assert.ok(posts.success.total > 3000);
  assert.ok(posts.success.items.every(item => item.contentType === 'post'));
  assert.equal((await listReview({ $i, heichelId: 'stress', status: 'all', contentType: 'all', search: 'item' })).success.total, 7000);
  assert.equal((await listReview({ $i, heichelId: 'stress', status: 'any', contentType: '*', search: 'summary 33' })).success.total, 111);
  assert.equal((await listReview({ $i, heichelId: 'stress', status: 'all', search: 'sealed-22' })).success.total, 0);
  const approvals = await Promise.all(Array.from({ length: 16 }, () => approveReview({ $i, heichelId: 'stress', reviewId: 'r1', aliasId: 'mod', verifyHeichelAuthority: verify })));
  assert.equal(approvals.filter(x => x.success).length, 1);
  assert.equal(approvals.filter(x => x.error?.code === 'ALREADY_REVIEWED').length, 15);
  const rejected = await rejectReview({ $i, heichelId: 'stress', reviewId: 'r2', aliasId: 'mod', note: 'bulk moderation reject', verifyHeichelAuthority: verify });
  assert.equal(rejected.success.status, 'rejected');
  assert.equal((await listReview({ $i, heichelId: 'stress', status: 'pending', search: 'item' })).success.total, 6998);
  assert.equal((await listReview({ $i, heichelId: 'stress', status: 'all', search: 'item' })).success.total, 7000);
  await seedNotes($i);
  const noteClamp = await notes.listNotifications({ $i, aliasId: 'keeper', limit: 999, offset: -99, search: 'note' });
  assert.equal(noteClamp.success.limit, 100);
  assert.equal(noteClamp.success.offset, 0);
  assert.equal(noteClamp.success.items.length, 100);
  assert.equal(noteClamp.success.total, 3500);
  assert.equal((await notes.listNotifications({ $i, aliasId: 'keeper', type: 'all', limit: 1000 })).success.total, 3500);
  assert.equal((await notes.listNotifications({ $i, aliasId: 'keeper', type: '*', search: 'entity title 12', limit: 100 })).success.total, 111);
  const noteTail = await notes.listNotifications({ $i, aliasId: 'keeper', limit: 75, offset: 3425, search: 'note' });
  assert.equal(noteTail.success.items.length, 75);
  assert.equal(noteTail.success.hasMore, false);
  assert.equal((await notes.listNotifications({ $i, aliasId: 'keeper', search: 'note-sealed-3', limit: 100 })).success.total, 0);
  const commentNotes = await notes.listNotifications({ $i, aliasId: 'keeper', type: 'comment', limit: 100 });
  assert.equal(commentNotes.success.limit, 100);
  assert.equal(commentNotes.success.total, 1750);
  assert.ok(commentNotes.success.items.every(item => item.type === 'comment'));
  console.log('B"H communityStress.test passed at 7000 reviews and 3500 notifications with all-type filters');
})().catch(error => { console.error(error); process.exit(1); });
