// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commentSitemapBoundaries.test.js
 * @description
 * The Awtsmoos pushes alias census and comment shards one step beyond each boundary, proving Awtsmoos.com neither loses nor repeats a road;
 * five hundred becomes two pages at five hundred one, and ten thousand comments become two exact vessels when one more carries the load.
 */

const assert = require('node:assert/strict');
const {
	ALIAS_PAGE_SIZE,
	COMMENT_SHARD_SIZE,
	createCommentSitemapData
} = require('../../comments/sitemap/commentSitemapDataFactory.js');

const aliases = Array.from({ length: ALIAS_PAGE_SIZE + 1 }, (_, index) => `alias-${index + 1}`);
const pointers = Array.from({ length: COMMENT_SHARD_SIZE + 1 }, (_, index) => ({
	commentId: `comment-${index + 1}`,
	heichelId: 'ikar',
	postId: 'post-1'
}));
const pagesRead = [];
const data = createCommentSitemapData({
	countAliases: async () => aliases.length,
	listAliasIds: async ({ page, pageSize }) => {
		pagesRead.push(page);
		const start = (page - 1) * pageSize;
		return aliases.slice(start, start + pageSize);
	},
	listPointers: (_$i, aliasId) => aliasId === 'alias-1' ? pointers : [],
	validateAliasIds: async (_$i, ids) => ids
});

Promise.resolve()
	.then(async () => {
		assert.equal((await data.allPublicAliasIds({})).length, ALIAS_PAGE_SIZE + 1);
		assert.deepEqual(pagesRead, [1, 2]);
		assert.deepEqual(await data.commentShardPaths({}), [
			'/comments/by-alias/alias-1/1',
			'/comments/by-alias/alias-1/2'
		]);
		assert.equal(data.commentsForAlias({}, 'alias-1', 1).length, COMMENT_SHARD_SIZE);
		assert.equal(data.commentsForAlias({}, 'alias-1', 2).length, 1);
		assert.ok(data.commentsForAlias({}, 'alias-1', 2)[0].endsWith('/comment-10001'));
	})
	.then(() => console.log('COMMENT_SITEMAP_BOUNDARIES_PASS'));
