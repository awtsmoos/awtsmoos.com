// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LegacyPostCommentMutations
 * @description Named legacy create/update/delete operations over the dedicated rich store.
 */
const compat = require('../richCompatibility.js');
const postRef = require('../postRefComment.js');
const { verifyAliasOwnership } = require('../../alias.js');
const { er, methodIs, getUserId } = require('./utils.js');
const read = require('./postReadOperations.js');

/** True when the session user owns the given alias (self-service cleanup). */
async function ownsAlias($i, userid, aliasId) {
	if (!userid || !aliasId) return false;
	try {
		return Boolean(await verifyAliasOwnership(aliasId, $i, userid));
	} catch {
		return false;
	}
}

async function collection($i, userid, vars) {
	const incoming = compat.source($i);
	if (methodIs($i, 'GET')) {
		return $i.$_GET?.aliasId
			? read.aliasComments($i, vars, $i.$_GET.aliasId)
			: read.aliases($i, vars);
	}
	if (methodIs($i, 'POST')) {
		return compat.createRoot({
			$i,
			userid,
			heichelId: vars.heichel,
			postId: vars.post,
			seriesId: read.seriesFrom(incoming),
			aliasId: incoming.aliasId
		});
	}
	if (methodIs($i, 'PUT')) {
		if (!incoming.commentId) {
			return er({ message: 'commentId is required', code: 'MISSING_PARAMS' });
		}
		return compat.updateLegacy({
			$i,
			userid,
			heichelId: vars.heichel,
			postId: vars.post,
			commentId: incoming.commentId,
			aliasId: incoming.aliasId
		});
	}
	if (methodIs($i, 'DELETE')) {
		// Bulk-deleting every comment on a post used to require no
		// authorization at all. Gate it like the canonical bulk routes:
		// the post's owner or an admin only.
		const authz = await postRef.authorizeTargetWrite({
			$i,
			userid: getUserId($i, userid),
			heichelId: vars.heichel,
			postId: vars.post
		});
		if (!authz) {
			return er({ message: 'Only the post owner or admin may delete all of its comments.', code: 'NOT_AUTHORIZED' });
		}
		return compat.deleteAll({
			$i,
			heichelId: vars.heichel,
			postId: vars.post
		});
	}
	return er({ message: 'Method Not Allowed', code: 405 });
}

async function aliasFacade($i, userid, vars) {
	const incoming = compat.source($i);
	if (methodIs($i, 'GET')) {
		return $i.$_GET?.all === 'true' || read.verse($i) !== ''
			? read.aliasComments($i, vars, vars.alias)
			: read.aliasSections($i, vars, vars.alias);
	}
	if (methodIs($i, 'POST')) {
		return compat.createRoot({
			$i,
			userid,
			heichelId: vars.heichel,
			postId: vars.post,
			seriesId: read.seriesFrom(incoming),
			aliasId: vars.alias
		});
	}
	if (methodIs($i, 'PUT')) {
		if (!incoming.commentId) {
			return er({ message: 'commentId is required', code: 'MISSING_PARAMS' });
		}
		return compat.updateLegacy({
			$i,
			userid,
			heichelId: vars.heichel,
			postId: vars.post,
			commentId: incoming.commentId,
			aliasId: vars.alias
		});
	}
	if (methodIs($i, 'DELETE')) {
		// Deleting one alias's comments on a post used to require no
		// authorization at all. Allow the post owner / an admin, or the
		// session user deleting their OWN alias's comments.
		const uid = getUserId($i, userid);
		const authz = await postRef.authorizeTargetWrite({
			$i,
			userid: uid,
			heichelId: vars.heichel,
			postId: vars.post
		});
		if (!authz && !(await ownsAlias($i, uid, vars.alias))) {
			return er({ message: 'Only the post owner, an admin, or the comments\' author may delete these comments.', code: 'NOT_AUTHORIZED' });
		}
		return compat.deleteAlias({
			$i,
			heichelId: vars.heichel,
			postId: vars.post,
			aliasId: vars.alias
		});
	}
	return er({ message: 'Method Not Allowed', code: 405 });
}

module.exports = {
	aliasFacade,
	collection
};
