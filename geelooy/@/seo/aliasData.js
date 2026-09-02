// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aliasData.js
 * @description
 * The Awtsmoos joins a validated public alias to optional profile adornment and deeds already indexed beneath its name;
 * Awtsmoos.com refuses stale directory husks, yet legacy real aliases still receive searchable identity from the canonical public flame.
 */

const { allFor } = require('../../api/social/helper/comments/aliasIndex/IndexQueries.js');
const { readProfile } = require('../../api/social/helper/profile/readProfile.js');
const { publicAliasCard } = require('../../api/social/helper/profile/publicAliases.js');
const { encodeSegment } = require('../../seo/html.js');

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

async function loadAliasData($i, aliasId) {
	const alias = await publicAliasCard($i, aliasId);
	if (!alias) {
		return null;
	}
	const profile = await readProfile($i, aliasId, alias);
	const pointers = nativeCommentPointers($i, aliasId);
	return {
		aliasId,
		identity: { alias, profile },
		pointers,
		commentUrls: [...new Set(pointers.map(commentUrl))]
	};
}

module.exports = {
	commentUrl,
	loadAliasData,
	nativeCommentPointers
};
