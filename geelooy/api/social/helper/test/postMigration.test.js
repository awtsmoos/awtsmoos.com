//B"H
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const migration = require('../packed/postMigration.js');
const packed = require('../packed/socialPacked.js');

function makeDb(directory) {
  const store = new Map();
  return {
    directory,
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
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-post-migration-'));
  const db = makeDb(tmp);
  const $i = { db };
  await db.write('/social/heichelos/h1/series/root/posts/p1', { title: 'Legacy One', aliasId: 'a1' });
  await db.write('/social/heichelos/h1/series/root/posts/p2', { title: 'Legacy Two', aliasId: 'a2' });

  const dry = await migration.dryRunPostMigration({ $i, heichelId: 'h1', seriesId: 'root' });
  assert.equal(dry.total, 2);
  assert.equal(dry.toMirror, 2);

  const run = await migration.runPostMigration({ $i, heichelId: 'h1', seriesId: 'root' });
  assert.equal(run.mirrored, 2);
  assert.equal(packed.readPacked({ $i, shard: 'core', key: '/posts/h1/p1' }).value.title, 'Legacy One');
  assert.equal(packed.listPackedRecords({ $i, shard: 'audit' }).filter(record => record.meta?.kind === 'migrationManifest').length, 1);

  const dryAgain = await migration.dryRunPostMigration({ $i, heichelId: 'h1', seriesId: 'root' });
  assert.equal(dryAgain.toMirror, 0);

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('B"H postMigration.test passed');
})().catch(error => { console.error(error); process.exit(1); });
