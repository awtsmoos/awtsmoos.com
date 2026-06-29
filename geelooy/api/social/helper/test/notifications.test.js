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
    entity: { type: 'comment', id: `c${index}` },
    actionUrl: `/h/post#c${index}`
  });
}
(async () => {
  const $i = { db: makeDb(), $_GET: {}, $_POST: {} };
  const created = await makeNote($i, 1, { type: 'reply', title: 'Alice replied', body: 'A reply appeared.' });
  assert.equal(created.success.type, 'reply');
  const list = await notes.listNotifications({ $i, aliasId: 'bob', limit: 1 });
  assert.equal(list.success.items.length, 1);
  assert.equal(list.success.items[0].read, false);
  assert.equal(list.success.hasMore, false);
  const count = await notes.countUnreadNotifications({ $i, aliasId: 'bob' });
  assert.equal(count.success.count, 1);
  const read = await notes.markNotificationRead({ $i, aliasId: 'bob', notificationId: created.success.id });
  assert.equal(read.success.read, true);
  const after = await notes.countUnreadNotifications({ $i, aliasId: 'bob' });
  assert.equal(after.success.count, 0);
  const fanout = await notes.fanoutNotification({ $i, toAliases: ['bob', 'charlie', 'charlie'], fromAliasId: 'alice', type: 'chat', title: 'Fanout', body: 'Batch notice' });
  assert.equal(fanout.success.length, 2);
  const polled = await notes.pollNotifications({ $i, aliasId: 'charlie', since: 0 });
  assert.equal(polled.success.length, 1);
  const prefs = await notes.updateNotificationPreferences({ $i, aliasId: 'bob', patch: { emailReady: false, mutedTypes: ['chat'] } });
  assert.equal(prefs.success.emailReady, false);
  const archived = await notes.archiveNotification({ $i, aliasId: 'charlie', notificationId: polled.success[0].id });
  assert.equal(archived.success.archived, true);
  const hidden = await notes.listNotifications({ $i, aliasId: 'charlie' });
  assert.equal(hidden.success.total, 0);

  for (let i = 2; i <= 7; i++) await makeNote($i, i);
  const firstPage = await notes.listNotifications({ $i, aliasId: 'bob', limit: 3, offset: 0 });
  assert.equal(firstPage.success.items.length, 3);
  assert.equal(firstPage.success.hasMore, true);
  assert.equal(firstPage.success.limit, 3);
  const secondPage = await notes.listNotifications({ $i, aliasId: 'bob', limit: 3, offset: 3 });
  assert.equal(secondPage.success.items.length, 3);
  assert.notEqual(firstPage.success.items[0].id, secondPage.success.items[0].id);
  const searched = await notes.listNotifications({ $i, aliasId: 'bob', search: 'Body 6', limit: 10 });
  assert.equal(searched.success.total, 1);
  assert.equal(searched.success.items[0].body, 'Body 6');
  const comments = await notes.listNotifications({ $i, aliasId: 'bob', type: 'comment', limit: 10 });
  assert.ok(comments.success.items.every(item => item.type === 'comment'));
  console.log('B"H notifications.test passed');
})().catch(error => { console.error(error); process.exit(1); });
