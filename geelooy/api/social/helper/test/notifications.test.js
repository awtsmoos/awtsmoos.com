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

(async () => {
  const $i = { db: makeDb(), $_GET: {}, $_POST: {} };
  const created = await notes.createNotification({
    $i,
    toAliasId: 'bob',
    fromAliasId: 'alice',
    type: 'reply',
    title: 'Alice replied',
    body: 'A reply appeared.',
    entity: { type: 'comment', id: 'c1' },
    actionUrl: '/h/post#c1'
  });
  assert.equal(created.success.type, 'reply');

  const list = await notes.listNotifications({ $i, aliasId: 'bob' });
  assert.equal(list.success.length, 1);
  assert.equal(list.success[0].read, false);

  const count = await notes.countUnreadNotifications({ $i, aliasId: 'bob' });
  assert.equal(count.success.count, 1);

  const read = await notes.markNotificationRead({ $i, aliasId: 'bob', notificationId: created.success.id });
  assert.equal(read.success.read, true);

  const after = await notes.countUnreadNotifications({ $i, aliasId: 'bob' });
  assert.equal(after.success.count, 0);

  const fanout = await notes.fanoutNotification({
    $i,
    toAliases: ['bob', 'charlie', 'charlie'],
    fromAliasId: 'alice',
    type: 'chat',
    title: 'Fanout',
    body: 'Batch notice'
  });
  assert.equal(fanout.success.length, 2);

  const polled = await notes.pollNotifications({ $i, aliasId: 'charlie', since: 0 });
  assert.equal(polled.success.length, 1);
  assert.ok(polled.cursor);

  console.log('B"H notifications.test passed');
})().catch(error => { console.error(error); process.exit(1); });
