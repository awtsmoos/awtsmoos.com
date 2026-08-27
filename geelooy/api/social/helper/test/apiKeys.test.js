//B"H
const assert = require('assert');
const apiKeys = require('../apiKeys.js');

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
  const $i = { db: makeDb(), request: { user: { info: { userId: 'userA' } }, headers: {} }, $_POST: { label: 'Node CLI' } };
  const created = await apiKeys.createApiKey({ $i });
  assert.ok(created.success.key.startsWith('awt_'));
  assert.equal(created.success.record.label, 'Node CLI');
  assert.equal(created.success.record.hash, undefined);

  const listed = await apiKeys.listApiKeys({ $i });
  assert.equal(listed.success.length, 1);
  assert.equal(listed.success[0].hash, undefined);

  $i.request.headers = { authorization: `Bearer ${created.success.key}` };
  const verified = await apiKeys.verifyApiKey({ $i });
  assert.equal(verified.success.userId, 'userA');

  const revoked = await apiKeys.revokeApiKey({ $i, keyId: created.success.record.id });
  assert.ok(revoked.success.revokedAt);
  const denied = await apiKeys.verifyApiKey({ $i });
  assert.equal(denied.error.code, 'KEY_NOT_FOUND');

  console.log('B"H apiKeys.test passed');
})().catch(error => { console.error(error); process.exit(1); });
