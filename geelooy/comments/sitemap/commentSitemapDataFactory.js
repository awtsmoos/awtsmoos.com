// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commentSitemapDataFactory.js
 * @description
 * The Awtsmoos separates comment-discovery law from database plumbing, so roots and replies can be proven in a clean test vessel;
 * Awtsmoos.com keeps production dependencies unchanged while deterministic fixtures may reveal every shard without touching a user's level.
 */

const { encodeSegment } = require('../../seo/html.js');

const ALIAS_PAGE_SIZE = 500;
const COMMENT_SHARD_SIZE = 10000;

function commentPath(pointer) {
	return `/heichelos/${encodeSegment(pointer.heichelId)}/posts/${encodeSegment(pointer.postId)}/comments/${encodeSegment(pointer.commentId)}`;
}

/** @description Creates bounded comment sitemap data functions from injected compact index dependencies. */
function createCommentSitemapData({ countAliases, listAliasIds, listPointers, validateAliasIds }) {
	function livePointers($i, aliasId) {
		return listPointers($i, aliasId)
			.filter(pointer => pointer?.commentId && pointer?.heichelId && pointer?.postId && !pointer.deleted);
	}
	async function allPublicAliasIds($i) {
		const count = await countAliases($i);
		const pages = Math.max(1, Math.ceil(count / ALIAS_PAGE_SIZE));
		const aliases = [];
		for (let page = 1; page <= pages; page += 1) {
			const candidates = await listAliasIds({ $i, page, pageSize: ALIAS_PAGE_SIZE });
			aliases.push(...await validateAliasIds($i, candidates));
		}
		return [...new Set(aliases)];
	}
	async function commentShardPaths($i) {
		const aliases = await allPublicAliasIds($i);
		const paths = [];
		for (const aliasId of aliases) {
			const pages = Math.ceil(livePointers($i, aliasId).length / COMMENT_SHARD_SIZE);
			for (let page = 1; page <= pages; page += 1) paths.push(`/comments/by-alias/${encodeSegment(aliasId)}/${page}`);
		}
		return paths;
	}
	function commentsForAlias($i, aliasId, page) {
		const offset = (page - 1) * COMMENT_SHARD_SIZE;
		return livePointers($i, aliasId).slice(offset, offset + COMMENT_SHARD_SIZE).map(commentPath);
	}
	return { allPublicAliasIds, commentShardPaths, commentsForAlias, livePointers };
}

module.exports = { ALIAS_PAGE_SIZE, COMMENT_SHARD_SIZE, commentPath, createCommentSitemapData };
