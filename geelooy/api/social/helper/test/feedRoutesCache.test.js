// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file feedRoutesCache.test.js
 * @description
 * Proves the platform feed still serves posts when the search index shard
 * is absent. B"H 2026-11-09: the search store was deleted Nov 6 and the
 * bulk importer deliberately skips writing search records while it is
 * absent, so postsFromIndex read ONLY the search shard and the feed
 * rendered nothing, silently. The fix falls back to the allPosts shard,
 * which holds the same compact post values the search index held.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { fileFor } = require('../packed/socialPackedEngine.js');
const { clearListRecordsCache } = require('../packed/socialPackedList.js');
const { postsFromIndex } = require('../platform/feedRoutesCache.js');

function tempRoot() {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-feed-cache-'));
}

function seedShard(root, shard, records) {
	const file = fileFor(root, shard);
	fs.mkdirSync(path.dirname(file), { recursive: true });
	fs.writeFileSync(file, records.map(r => JSON.stringify(r)).join('\n') + '\n');
	return file;
}

function allPostRecord(heichelId, postId, aliasId) {
	return {
		op: 'put',
		key: `/allPosts/${heichelId}/${postId}`,
		value: {
			postId, heichelId, seriesId: 'root', aliasId,
			type: 'post', title: `Post ${postId}`, excerpt: `Excerpt ${postId}`,
			connected: true, updatedAt: 1700000000000
		},
		meta: { kind: 'allPost', aliasId, heichelId, seriesId: 'root' },
		ts: 1
	};
}

function searchRecord(heichelId, postId, aliasId) {
	return {
		op: 'put',
		key: `/indexes/postsByHeichel/${heichelId}/${postId}`,
		value: {
			postId, heichelId, seriesId: 'root', aliasId,
			type: 'post', title: `Indexed ${postId}`, excerpt: `Indexed excerpt ${postId}`,
			connected: true, updatedAt: 1700000000000
		},
		meta: { kind: 'materializedIndex', index: 'postsByHeichel' },
		ts: 1
	};
}

test('postsFromIndex falls back to allPosts when the search shard is absent (live Nov 9 state)', () => {
	const root = tempRoot();
	// Live state: the search shard file does not exist at all; allPosts does.
	seedShard(root, 'allPosts', [
		allPostRecord('ikar', 'p1', 'abarbanel'),
		allPostRecord('ikar', 'p2', 'abarbanel')
	]);
	assert.equal(fs.existsSync(fileFor(root, 'search')), false);
	const $i = { db: { directory: root } };
	const posts = postsFromIndex($i);
	assert.equal(posts.length, 2);
	assert.deepEqual(posts.map(p => p.postId).sort(), ['p1', 'p2']);
	assert.equal(posts[0].title, 'Post p1');
	clearListRecordsCache();
});

test('postsFromIndex prefers the search index when it has posts', () => {
	const root = tempRoot();
	seedShard(root, 'allPosts', [allPostRecord('ikar', 'p1', 'abarbanel')]);
	seedShard(root, 'search', [searchRecord('ikar', 'p9', 'abarbanel')]);
	const $i = { db: { directory: root } };
	const posts = postsFromIndex($i);
	assert.equal(posts.length, 1);
	assert.equal(posts[0].postId, 'p9');
	assert.equal(posts[0].title, 'Indexed p9');
	clearListRecordsCache();
});

test('postsFromIndex returns empty when both the search index and allPosts are absent', () => {
	const root = tempRoot();
	const $i = { db: { directory: root } };
	const posts = postsFromIndex($i);
	assert.deepEqual(posts, []);
	clearListRecordsCache();
});
