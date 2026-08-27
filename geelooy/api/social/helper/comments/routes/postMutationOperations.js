// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LegacyPostCommentMutations
 * @description Named legacy create/update/delete operations over the dedicated rich store.
 */
const compat = require('../richCompatibility.js');
const { er, methodIs } = require('./utils.js');
const read = require('./postReadOperations.js');

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
