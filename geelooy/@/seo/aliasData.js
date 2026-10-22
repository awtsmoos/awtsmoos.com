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

// B"H 2026-10-21 (alias profiles): the public profile must show ALL authored
// posts, not a 12-post teaser — the profile API already returns the full
// authored list (240 for @rashi), so the SEO render matches it. The cap
// stays only as a runaway guard for pathological accounts.
const AUTHORED_POST_LIMIT = 1000;

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

// B\"H 2026-10-21 (alias speed): loadAliasData re-read the alias card, the
// profile, the authored-post collection (packed census + heichel scans) and
// the full comment-pointer index on EVERY render — and the comments archive
// re-ran it once per page. Node-direct TTFB measured 6.65-9.64s. A short
// in-process TTL cache keyed by alias collapses repeat renders and archive
// pagination to one assembly per minute; public alias data changes slowly
// and the client profile API stays uncached for live state.
const ALIAS_DATA_TTL_MS = 60_000;
const aliasDataCache = new Map();

async function loadAliasData($i, aliasId) {
	const cached = aliasDataCache.get(aliasId);
	if (cached && cached.expires > Date.now()) return cached.data;
	const data = await assembleAliasData($i, aliasId);
	if (data) aliasDataCache.set(aliasId, { data, expires: Date.now() + ALIAS_DATA_TTL_MS });
	return data;
}

async function assembleAliasData($i, aliasId) {
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
