// B"H
/**
 * Chapter 103: legacy profile compatibility.
 *
 * Ancient aliases may not have new profile indexes. They still have old
 * postsSubmitted indexes and old created/contributed Heichel maps. The profile
 * API must gather those sparks so @rambam-style aliases do not appear empty.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DosDB = require('../../../../ayzarim/DosDB/index.js');
const { aggregateProfile } = require('../helper/profile/index.js');

const repoRoot = process.cwd();
const dbRoot = path.resolve(repoRoot, '../../dayuhChadash');
const suffix = Date.now().toString(36);
const aliasId = `legacy_alias_${suffix}`;
const heichelId = `legacy_heichel_${suffix}`;
const postId = `legacy_post_${suffix}`;

async function seed() {
  const db = new DosDB(dbRoot);
  await db.init();
  await db.write(`/social/aliases/${aliasId}/info`, { name: 'Legacy Alias', description: 'Old system profile.', user: `user_${suffix}` });
  await db.write(`/social/aliases/${aliasId}/heichelos`, { [heichelId]: true });
  await db.write(`/social/aliases/${aliasId}/postsSubmitted/inHeichel/${heichelId}/inSeries/chassidus`, { [postId]: true });
  await db.write(`/social/heichelos/${heichelId}/info`, { name: 'Legacy Heichel', description: 'Indexed only the old way.', author: aliasId });
  await db.write(`/social/heichelos/${heichelId}/series/chassidus/info`, { name: 'Chassidus' });
  await db.write(`/social/heichelos/${heichelId}/series/chassidus/posts`, { [postId]: true });
  await db.write(`/social/heichelos/${heichelId}/posts/${postId}`, { title: 'Ancient Light', content: 'This post came through the old system.', author: aliasId, parentSeriesId: 'chassidus', timestamp: 7 });
  return db;
}

const db = await seed();
const profile = await aggregateProfile({ $i: { db }, aliasId });
assert.ok(profile, 'profile missing');
assert.ok(profile.heichelos.some(item => item.id === heichelId), 'legacy heichel not shown');
assert.ok(profile.posts.some(item => item.postId === postId && item.seriesId === 'chassidus'), 'legacy post not shown');
assert.equal(profile.stats.posts, 1, 'legacy post count wrong');
console.log('B"H profileLegacyCompatibility.test passed');
