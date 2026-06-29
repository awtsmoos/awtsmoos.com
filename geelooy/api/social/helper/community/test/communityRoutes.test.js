//B"H
const assert = require('assert');
const communityRoutes = require('../../../_awtsmoos.community.js');
const contentRoutes = require('../../../_awtsmoos.content.js');
function makeDb() {
  const store = new Map();
  return {
    store,
    async write(path, value) { store.set(path, value); return { path, value }; },
    async delete(path) { const old = store.get(path); store.delete(path); return { path, old }; },
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
function vessel(method = 'GET', post = {}, get = {}) {
  return { db: makeDb(), request: { method }, $_POST: post, $_GET: get, async fetchAwtsmoos() { return {}; } };
}
(async () => {
  let $i = vessel('GET');
  let routes = communityRoutes({ $i });
  assert.equal((await routes['/heichelos/:heichel/settings/community']({ heichel: 'h1' })).success.allowPublicSubmissions, true);
  $i = vessel('POST', { aliasId: 'mod', requireModeratorApproval: false });
  await $i.db.write('/social/heichelos/h1/editors', ['mod']);
  routes = communityRoutes({ $i });
  assert.equal((await routes['/heichelos/:heichel/settings/community']({ heichel: 'h1' })).success.requireModeratorApproval, false);
  $i = vessel('POST', { aliasId: 'writer', title: 'Pending route', content: 'body', contentType: 'post' });
  routes = communityRoutes({ $i });
  const created = await routes['/heichelos/:heichel/review']({ heichel: 'h1' });
  assert.equal(created.success.status, 'pending');
  $i.request.method = 'GET'; $i.$_GET = { search: 'Pending route', status: 'all', limit: '500', offset: '-2' };
  const queue = await routes['/heichelos/:heichel/moderation']({ heichel: 'h1' });
  assert.equal(queue.success.total, 1);
  assert.equal(queue.success.limit, 100);
  assert.equal(queue.success.offset, 0);
  $i.request.method = 'POST'; $i.$_POST = { aliasId: 'bad', note: 'no' };
  const denied = await routes['/heichelos/:heichel/review/:review/reject']({ heichel: 'h1', review: created.success.id });
  assert.equal(denied.error.code, 'NO_MODERATION_PERMISSION');
  $i.$_POST = { aliasId: 'mod', note: 'approved', publish: false };
  await $i.db.write('/social/heichelos/h1/editors', ['mod']);
  const approved = await routes['/heichelos/:heichel/review/:review/approve']({ heichel: 'h1', review: created.success.id });
  assert.equal(approved.success.status, 'approved');
  assert.equal((await routes['/heichelos/:heichel/review/:review/approve']({ heichel: 'h1', review: created.success.id })).error.code, 'ALREADY_REVIEWED');
  $i = vessel('POST', { aliasId: 'writer', postId: 'p1', title: 'Route post', content: 'Body', seriesId: 'root' });
  const content = contentRoutes({ $i });
  const pending = await content['/content/heichelos/:heichel/posts']({ heichel: 'h2' });
  assert.equal(pending.success.status, 'pending');
  assert.equal(pending.success.contentType, 'post');
  console.log('B"H communityRoutes.test passed');
})().catch(error => { console.error(error); process.exit(1); });
