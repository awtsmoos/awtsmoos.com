// B"H
/**
 * Chapter 113: connected post migration contract.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require('../../../../../../ayzarim/DosDB/index.js');
const { runPostMigration } = require('../postMigration.js');
const { allPosts } = require('../allPostsIndex.js');
const { readPacked, allShardStats } = require('../socialPacked.js');
const { shardFile, legacyShardFile, logicalKey } = require('../shardPaths.js');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-connected-posts-'));
const db = new DosDB(dir);
await db.init();
const $i = { db };
await db.write('/social/heichelos', { h1: true });
await db.write('/social/heichelos/h1/series/root/posts', { p1: true });
await db.write('/social/heichelos/h1/series/s1/posts', { p2: true, missing: true });
await db.write('/social/heichelos/h1/posts/p1', { title: 'Root Post', author: 'a1', content: 'root' });
await db.write('/social/heichelos/h1/posts/p2', { title: 'Series Post', author: 'a1', content: 'series' });
await db.write('/social/heichelos/h1/posts/orphan', { title: 'Orphan', author: 'a1' });

const dry = await runPostMigration({ $i, dryRun: true });
assert.equal(dry.total, 2, 'only connected posts should be counted');
const report = await runPostMigration({ $i });
assert.equal(report.mirrored, 2, 'two connected posts mirrored');
assert.equal(allPosts({ $i, aliasId: 'a1' }).length, 2, 'allPosts census should contain connected posts');
assert.ok(readPacked({ $i, shard: 'core', key: logicalKey(['posts', 'h1', 'p1']) }), 'core post missing');
assert.ok(fs.existsSync(shardFile(dir, 'core')), 'new core awtsdb file missing');
assert.ok(fs.existsSync(shardFile(dir, 'allPosts')), 'allPosts awtsdb file missing');
assert.equal(legacyShardFile(dir, 'core').endsWith('social.core.awtsocial'), true, 'legacy fallback name should remain known');
assert.ok(allShardStats({ $i }).some(row => row.shard === 'meta'), 'meta shard stats missing');
console.log('B"H connectedPostMigration.test passed');
