// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file data.js
 * @description
 * The Awtsmoos gathers compact native comment coordinates only beneath aliases that still resolve as public identity;
 * Awtsmoos.com shards those valid deeds without re-reading every body, keeping stale names and private shadows outside discovery.
 */

const { allFor } = require('../../api/social/helper/comments/aliasIndex/IndexQueries.js');
const { publicAliasCount, publicAliasIds } = require('../../api/social/helper/profile/publicAliases.js');
const { validatedAliasIds } = require('../../seo/publicAliasValidity.js');
const { encodeSegment } = require('../../seo/html.js');

const ALIAS_PAGE_SIZE = 500;
const COMMENT_SHARD_SIZE = 10000;

function livePointers($i, aliasId) {
	try {
		return allFor($i, aliasId).filter(pointer => pointer?.commentId && pointer?.heichelId && pointer?.postId && !pointer.deleted);
	} catch (error) {
		console.error('[Awtsmoos comment sitemap] Alias index read failed.', error);
		return [];
	}
}

function commentPath(pointer) {
	return `/heichelos/${encodeSegment(pointer.heichelId)}/posts/${encodeSegment(pointer.postId)}/comments/${encodeSegment(pointer.commentId)}`;
}

async function allPublicAliasIds($i) {
	const count = await publicAliasCount($i);
	const pages = Math.max(1, Math.ceil(count / ALIAS_PAGE_SIZE));
	const aliases = [];
	for (let page = 1; page <= pages; page += 1) {
		const candidates = await publicAliasIds({ $i, page, pageSize: ALIAS_PAGE_SIZE });
		aliases.push(...await validatedAliasIds($i, candidates));
	}
	return [...new Set(aliases)];
}

async function commentShardPaths($i) {
	const aliases = await allPublicAliasIds($i);
	const paths = [];
	for (const aliasId of aliases) {
		const pages = Math.ceil(livePointers($i, aliasId).length / COMMENT_SHARD_SIZE);
		for (let page = 1; page <= pages; page += 1) {
			paths.push(`/comments/by-alias/${encodeSegment(aliasId)}/${page}`);
		}
	}
	return paths;
}

function commentsForAlias($i, aliasId, page) {
	const offset = (page - 1) * COMMENT_SHARD_SIZE;
	return livePointers($i, aliasId).slice(offset, offset + COMMENT_SHARD_SIZE).map(commentPath);
}

module.exports = {
	COMMENT_SHARD_SIZE,
	allPublicAliasIds,
	commentShardPaths,
	commentsForAlias,
	livePointers
};
