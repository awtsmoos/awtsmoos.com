//B"H
const assert = require('assert');
const notes = require('../notifications.js');
function makeDb() {
  const store = new Map();
  return {
    async write(path, value) { store.set(path, value); return { path, value }; },
    async get(path) {
      if (store.has(path)) return store.get(path);
      const prefix = path.endsWith('/') ? path : path + '/';
      const out = {};
      for (const [key, value] of store.entries()) {
        if (!key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length);
        if (!rest || rest.includes('/')) continue;
        out[rest] = value;
      }
      return Object.keys(out).length ? out : undefined;
    }
  };
}
async function makeNote($i, index, patch = {}) {
  return notes.createNotification({
    $i,
    toAliasId: patch.toAliasId || 'bob',
    fromAliasId: patch.fromAliasId || 'alice',
    type: patch.type || (index % 2 ? 'comment' : 'reply'),
    title: patch.title || `Notice ${index}`,
    body: patch.body || `Body ${index}`,
    entity: { type: 'comment', id: `c${index}`, title: patch.entityTitle || '', private: patch.private || '' },
    actionUrl: `/h/post#c${index}`,
    groupKey: patch.groupKey || ''
  });
}
(async () => {
  const $i = { db: makeDb(), $_GET: {}, $_POST: {} };
  const created = await makeNote($i, 1, { type: 'reply', title: 'Alice replied', body: 'A unique reply appeared.', entityTitle: 'Visible entity' });
  assert.equal(created.success.type, 'reply');
  assert.equal((await notes.listNotifications({ $i, aliasId: 'bob', limit: 1 })).success.items[0].read, false);
  assert.equal((await notes.countUnreadNotifications({ $i, aliasId: 'bob' })).success.count, 1);
  assert.equal((await notes.markNotificationRead({ $i, aliasId: 'bob', notificationId: created.success.id })).success.read, true);
  assert.equal((await notes.countUnreadNotifications({ $i, aliasId: 'bob' })).success.count, 0);
  const fanout = await notes.fanoutNotification({ $i, toAliases: ['bob', 'charlie', 'charlie'], fromAliasId: 'alice', type: 'chat', title: 'Fanout', body: 'Batch notice' });
  assert.equal(fanout.success.length, 2);
  const polled = await notes.pollNotifications({ $i, aliasId: 'charlie', since: 0 });
  assert.equal(polled.success.length, 1);
  assert.equal((await notes.updateNotificationPreferences({ $i, aliasId: 'bob', patch: { emailReady: false, mutedTypes: ['chat'] } })).success.emailReady, false);
  assert.equal((await notes.archiveNotification({ $i, aliasId: 'charlie', notificationId: polled.success[0].id })).success.archived, true);
  assert.equal((await notes.listNotifications({ $i, aliasId: 'charlie' })).success.total, 0);
  assert.equal((await notes.listNotifications({ $i, aliasId: 'charlie', includeArchived: true })).success.total, 1);
  for (let i = 2; i <= 130; i++) await makeNote($i, i, { private: 'hidden-private-' + i, entityTitle: 'visible entity ' + i });
  const clamped = await notes.listNotifications({ $i, aliasId: 'bob', limit: 500, offset: -10 });
  assert.equal(clamped.success.limit, 100);
  assert.equal(clamped.success.offset, 0);
  assert.equal(clamped.success.items.length, 100);
  assert.equal(clamped.success.hasMore, true);
  assert.ok((await notes.listNotifications({ $i, aliasId: 'bob', limit: 25, offset: 100 })).success.items.length > 0);
  assert.equal((await notes.listNotifications({ $i, aliasId: 'bob', search: 'A unique reply appeared', limit: 10 })).success.items[0].id, created.success.id);
  assert.equal((await notes.listNotifications({ $i, aliasId: 'bob', search: 'hidden-private-6', limit: 10 })).success.total, 0);
  assert.ok((await notes.listNotifications({ $i, aliasId: 'bob', search: 'visible entity 6', limit: 10 })).success.total > 0);
  const comments = await notes.listNotifications({ $i, aliasId: 'bob', type: 'comment', limit: 10 });
  assert.ok(comments.success.items.every(item => item.type === 'comment'));
  const allTypes = await notes.listNotifications({ $i, aliasId: 'bob', type: 'all', limit: 500 });
  assert.equal(allTypes.success.limit, 100);
  assert.equal(allTypes.success.total, 131);
  assert.equal(notes.typeFilter('all'), '');
  console.log('B"H notifications.test passed');
})().catch(error => { console.error(error); process.exit(1); });
