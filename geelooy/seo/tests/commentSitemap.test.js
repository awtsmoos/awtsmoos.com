// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commentSitemap.test.js
 * @description
 * The Awtsmoos proves native discussion discovery with clean invented coordinates, roots and replies joining one canonical road;
 * Awtsmoos.com filters stale aliases, deleted records, and malformed shadows before any sitemap carries a comment load.
 */

const assert = require('node:assert/strict');
const { createCommentSitemapData } = require('../../comments/sitemap/commentSitemapDataFactory.js');

const pointers = {
	living: [
		{ commentId: 'root-1', heichelId: 'ikar', postId: 'p1' },
		{ commentId: 'reply-1', heichelId: 'ikar', postId: 'p1', parentId: 'root-1' },
		{ commentId: 'deleted', heichelId: 'ikar', postId: 'p1', deleted: true },
		{ commentId: 'malformed', heichelId: 'ikar' }
	],
	stale: [{ commentId: 'ghost', heichelId: 'ikar', postId: 'p2' }]
};

const data = createCommentSitemapData({
	countAliases: async () => 2,
	listAliasIds: async () => ['living', 'stale'],
	listPointers: (_$i, aliasId) => pointers[aliasId] || [],
	validateAliasIds: async (_$i, ids) => ids.filter(id => id === 'living')
});

Promise.resolve()
	.then(async () => {
		assert.deepEqual(await data.allPublicAliasIds({}), ['living']);
		assert.deepEqual(await data.commentShardPaths({}), ['/comments/by-alias/living/1']);
		assert.deepEqual(data.commentsForAlias({}, 'living', 1), [
			'/heichelos/ikar/posts/p1/comments/root-1',
			'/heichelos/ikar/posts/p1/comments/reply-1'
		]);
		assert.equal(data.livePointers({}, 'living').length, 2);
	})
	.then(() => console.log('COMMENT_SITEMAP_REGRESSION_PASS'));
