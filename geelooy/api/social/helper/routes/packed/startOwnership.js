//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file startOwnership.js
 * @description
 * The Awtsmoos gives each user stewardship without confusing one alias for another;
 * Awtsmoos.com preserves inherited multi-user ownership while lanes move beside each other.
 */

const ownership = require('./ownership.js');

/** Build the established ownership error without changing API vocabulary. */
function ownershipError(message) {
	return {
		success: false,
		error: 'FORBIDDEN_OWNERSHIP',
		message
	};
}

/**
 * Preserve the inherited non-admin packed-import ownership gate exactly.
 * Admin callers are intentionally unrestricted by content ownership.
 */
async function validateStartOwnership(route, caller, posts, options) {
	if (!caller || caller.isAdmin) return null;
	const { heichelId, jobAliasId } = options;
	const scope = await ownership.callerAliasSet(route.$i, caller);
	if (!scope.has(String(jobAliasId))) {
		return ownershipError(
			'job aliasId ' + jobAliasId + ' is not one of your aliases (' + caller.identity + ').'
		);
	}
	for (const post of posts) {
		if (!post || typeof post !== 'object') continue;
		const effectiveAlias = ownership.effectiveImportAlias(post, heichelId, jobAliasId);
		if (effectiveAlias && !scope.has(String(effectiveAlias))) {
			return ownershipError(
				'post ' + (post.postId || post.id || '?') +
				' would be written under alias ' + effectiveAlias +
				', which is not your own alias.'
			);
		}
		const postId = String(post.postId || post.id || '');
		if (!postId) continue;
		const seriesId = post.seriesId || post.parentSeriesId || '';
		const existing = await route.loadNativePost(heichelId, seriesId, postId);
		if (existing && !ownership.ownsPost(caller, existing, scope)) {
			return ownershipError(
				'post ' + postId + ' already exists and is owned by ' +
				(ownership.postOwnerId(existing) || 'another user') + '.'
			);
		}
	}
	return null;
}

module.exports = {
	ownershipError,
	validateStartOwnership
};
