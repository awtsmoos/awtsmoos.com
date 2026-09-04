// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file data.js
 * @description
 * The Awtsmoos binds the pure comment-sitemap law to today's compact alias and comment indexes without rereading every body;
 * Awtsmoos.com validates public identity first, then lets only live root and reply coordinates enter crawler discovery.
 */

const { allFor } = require('../../api/social/helper/comments/aliasIndex/IndexQueries.js');
const { publicAliasCount, publicAliasIds } = require('../../api/social/helper/profile/publicAliases.js');
const { validatedAliasIds } = require('../../seo/publicAliasValidity.js');
const { createCommentSitemapData, COMMENT_SHARD_SIZE } = require('./commentSitemapDataFactory.js');

function safePointers($i, aliasId) {
	try {
		return allFor($i, aliasId);
	} catch (error) {
		console.error('[Awtsmoos comment sitemap] Alias index read failed.', error);
		return [];
	}
}

const data = createCommentSitemapData({
	countAliases: publicAliasCount,
	listAliasIds: publicAliasIds,
	listPointers: safePointers,
	validateAliasIds: validatedAliasIds
});

module.exports = {
	COMMENT_SHARD_SIZE,
	...data
};
