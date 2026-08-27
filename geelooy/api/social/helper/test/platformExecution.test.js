//B"H
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const packed = require('../packed/socialPacked.js');
const graphTx = require('../platform/graphTransactions.js');
const ops = require('../platform/ops.js');
const jobs = require('../platform/jobRunner.js');
const cacheSync = require('../platform/cacheSync.js');
const feeds = require('../platform/feedRoutes.js');
const threads = require('../platform/commentThreads.js');
const notifications = require('../notifications.js');

function makeDb(directory) {
  const store = new Map();
  return {
    directory,
    async write(p, v) { store.set(p, v); return { success: true }; },
    async get(p) {
      if (store.has(p)) return store.get(p);
      const prefix = `${p}/`;
      const names = [];
      for (const key of store.keys()) if (key.startsWith(prefix)) names.push(key.slice(prefix.length).split('/')[0]);
      return names.length ? Array.from(new Set(names)) : null;
    }
  };
}

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-platform-exec-'));
  const $i = { db: makeDb(tmp), request: { headers: {} }, $_GET: {}, $_POST: {} };
  packed.mirrorPost({ $i, post: { id: 'q1', heichelId: 'h1', aliasId: 'alice', title: 'Q', contentType: 'question' } });
  packed.mirrorPost({ $i, post: { id: 'a1', heichelId: 'h1', aliasId: 'bob', title: 'A', contentType: 'answer' } });

  const badTx = await graphTx.runGraphTransaction({ $i, actor: 'alice', edges: [{ kind: 'references', from: { type: 'post' }, to: { type: 'post', id: 'q1' } }] });
  assert.equal(badTx.error.code, 'GRAPH_TRANSACTION_REJECTED');
  const goodTx = await graphTx.runGraphTransaction({ $i, actor: 'alice', edges: [{ kind: 'references', from: { type: 'post', id: 'a1' }, to: { type: 'post', id: 'q1' } }] });
  assert.equal(goodTx.success.status, 'committed');
  assert.equal(graphTx.listGraphTransactions({ $i }).success.length, 2);

  const feed = feeds.feedHeichel({ $i, heichelId: 'h1' });
  assert.equal(feed.items.length, 2);
  assert.ok(feeds.feedHome({ $i, aliasId: 'alice' }).items.length >= 2);
  assert.ok(Array.isArray(feeds.feedTrending({ $i }).items));
  assert.ok(feeds.feedDiscover({ $i }).items.length >= 2);

  ops.cacheSet({ $i, key: 'k1', value: { ok: true }, ttlMs: 60000 });
  assert.equal(cacheSync.cacheGet({ $i, key: 'k1' }).success.value.ok, true);
  assert.equal(cacheSync.cacheInvalidate({ $i, key: 'k1' }).invalidated, true);
  assert.equal(cacheSync.cacheGet({ $i, key: 'k1' }).error.code, 'CACHE_INVALIDATED');

  ops.syncOp({ $i, aliasId: 'alice', op: 'draft.save', payload: { postId: 'q1' } });
  assert.equal(cacheSync.syncPull({ $i, aliasId: 'alice' }).success.length, 1);

  const note = await notifications.createNotification({ $i, toAliasId: 'alice', fromAliasId: 'bob', type: 'reply', title: 'Reply' });
  assert.equal(note.success.type, 'reply');
  const digest = await jobs.createNotificationDigest({ $i, aliasId: 'alice' });
  assert.equal(digest.count, 1);

  ops.enqueueJob({ $i, type: 'feed.materialize', payload: { heichelId: 'h1', aliasId: 'alice' } });
  const ran = await jobs.runQueuedJobs({ $i, limit: 3 });
  assert.equal(ran.ran, 1);
  assert.equal(ran.results[0].status, 'done');

  const rootThread = await threads.appendThreadComment({ $i, postId: 'q1', commentId: 'c1', aliasId: 'alice', content: 'root' });
  const replyThread = await threads.appendThreadComment({ $i, postId: 'q1', commentId: 'c2', parentId: 'c1', aliasId: 'bob', content: 'reply' });
  assert.equal(rootThread.packedAuditWritten, false);
  assert.equal(replyThread.packedAuditWritten, false);
  const ranked = await threads.rankedThread({ $i, postId: 'q1' });
  assert.equal(ranked.comments[0].commentId, 'c1');
  assert.equal(ranked.packedAuditRead, false);

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('B"H platformExecution.test passed');
})().catch(error => { console.error(error); process.exit(1); });
