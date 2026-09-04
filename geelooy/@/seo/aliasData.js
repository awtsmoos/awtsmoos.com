// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aliasData.js
 * @description
 * The Awtsmoos joins a validated public alias to profile adornment, authored Torah, and indexed discussion beneath its name;
 * Awtsmoos.com keeps the authored stream bounded while stale aliases remain outside search and real public deeds enter the flame.
 */

const { allFor } = require('../../api/social/helper/comments/aliasIndex/IndexQueries.js');
const { postsByAlias } = require('../../api/social/helper/profile/posts.js');
const { readProfile } = require('../../api/social/helper/profile/readProfile.js');
const { publicAliasCard } = require('../../api/social/helper/profile/publicAliases.js');
const { encodeSegment } = require('../../seo/html.js');

const AUTHORED_POST_LIMIT = 12;

function commentUrl(pointer = {}) {
	return `/heichelos/${encodeSegment(pointer.heichelId)}/posts/${encodeSegment(pointer.postId)}/comments/${encodeSegment(pointer.commentId)}`;
}

function nativeCommentPointers($i, aliasId) {
	try {
		return allFor($i, aliasId)
			.filter(pointer => pointer?.commentId && pointer?.heichelId && pointer?.postId && !pointer.deleted);
	} catch (error) {
		console.error('[Awtsmoos alias SEO] Native comment index read failed.', error);
		return [];
	}
}

async function safeAuthoredPosts($i, aliasId) {
	try {
		return await postsByAlias({ $i, aliasId, limit: AUTHORED_POST_LIMIT });
	} catch (error) {
		console.error('[Awtsmoos alias SEO] Authored post discovery failed.', error);
		return [];
	}
}

async function loadAliasData($i, aliasId) {
	const alias = await publicAliasCard($i, aliasId);
	if (!alias) return null;
	const [profile, authoredPosts] = await Promise.all([
		readProfile($i, aliasId, alias),
		safeAuthoredPosts($i, aliasId)
	]);
	const pointers = nativeCommentPointers($i, aliasId);
	return {
		aliasId,
		authoredPosts,
		identity: { alias, profile },
		pointers,
		commentUrls: [...new Set(pointers.map(commentUrl))]
	};
}

module.exports = {
	AUTHORED_POST_LIMIT,
	commentUrl,
	loadAliasData,
	nativeCommentPointers,
	safeAuthoredPosts
};
