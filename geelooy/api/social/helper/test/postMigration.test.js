//B"H
/**
 * Chapter 5: The test chamber lit the old root and the hidden branch together.
 *
 * The Awtsmoos, beyond body and form, recreates every assertion from nothing.
 * These tests prove the migration drinks only from active series storage,
 * writes full live post bodies into `social.core.awtsdb` and `social.allPosts.awtsdb`, records compact
 * manifests in meta, and treats omitted seriesId as the whole heichel tree.
 */

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
      const keys = await this.getObjectKeys(path);
      if (!keys.length) return undefined;
      const out = {};
      for (const key of keys) out[key] = true;
      return out;
    },
    async getObjectKeys(path) {
      const prefix = path.endsWith('/') ? path : path + '/';
      const keys = new Set();
      for (const key of store.keys()) {
        if (!key.startsWith(prefix)) continue;
        const rest = key.slice(prefix.length);
        if (!rest) continue;
        keys.add(rest.split('/')[0]);
      }
      return Array.from(keys);
    }
  };
}

async function seedSeriesPosts(db) {
  await db.write('/social/heichelos/h1/series/root/posts/p1', { title: 'Legacy One', aliasId: 'a1' });
  await db.write('/social/heichelos/h1/series/root/posts/p2', { title: 'Legacy Two', aliasId: 'a2' });
  await db.write('/social/heichelos/h1/series/branch/posts/p3', { title: 'Branch Three', aliasId: 'a3' });
  await db.write('/social/heichelos/h1/posts/orphan', { title: 'Do Not Migrate', aliasId: 'ghost' });
}

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-post-migration-'));
  const db = makeDb(tmp);
  const $i = { db };
  await seedSeriesPosts(db);

  const rootDry = await migration.dryRunPostMigration({ $i, heichelId: 'h1', seriesId: 'root' });
  assert.equal(rootDry.total, 2);
  assert.equal(rootDry.toMirror, 2);

  const allDry = await migration.dryRunPostMigration({ $i, heichelId: 'h1' });
  assert.equal(allDry.total, 3);
  assert.deepEqual(allDry.items.map(item => item.postId).sort(), ['p1', 'p2', 'p3']);

  const run = await migration.runPostMigration({ $i, heichelId: 'h1' });
  assert.equal(run.mirrored, 3);
  assert.equal(run.failed.length, 0);
  assert.equal(packed.readPacked({ $i, shard: 'allPosts', key: '/allPosts/h1/p1' }).value.title, 'Legacy One');
  assert.equal(packed.readPacked({ $i, shard: 'allPosts', key: '/allPosts/h1/p3' }).value.seriesId, 'branch');
  assert.equal(packed.readPacked({ $i, shard: 'allPosts', key: '/allPosts/h1/orphan' }), null);
  assert.equal(packed.readPacked({ $i, shard: 'core', key: '/posts/h1/p1' }).value.title, 'Legacy One');
  assert.equal(packed.listPackedRecords({ $i, shard: 'meta' }).filter(record => record.meta?.kind === 'migrationManifest').length, 1);

  const dryAgain = await migration.dryRunPostMigration({ $i, heichelId: 'h1' });
  assert.equal(dryAgain.toMirror, 0);

  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('B"H postMigration.test passed');
})().catch(error => { console.error(error); process.exit(1); });


