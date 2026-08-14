// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LegacyPostCommentReads
 * @description Named read operations over the dedicated rich-comment compatibility facade.
 */
const compat = require('../richCompatibility.js');

function seriesFrom(source = {}) {
	return source.seriesId || source.series || 'root';
}

function verse($i) {
	return compat.verseFrom($i.$_GET || {});
}

function context($i, vars, seriesId = seriesFrom($i.$_GET || {})) {
	return {
		$i,
		heichelId: vars.heichel,
		postId: vars.post,
		seriesId,
		verseSection: verse($i)
	};
}

function aliases($i, vars, seriesId) {
	return compat.authors(context($i, vars, seriesId));
}

function aliasComments($i, vars, aliasId, seriesId) {
	return compat.aliasComments({
		...context($i, vars, seriesId),
		aliasId
	});
}

function aliasSections($i, vars, aliasId, seriesId) {
	return compat.aliasSections({
		...context($i, vars, seriesId),
		aliasId
	});
}

module.exports = {
	aliasComments,
	aliasSections,
	aliases,
	context,
	seriesFrom,
	verse
};
