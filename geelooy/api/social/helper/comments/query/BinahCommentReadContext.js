//B"H
//Boruch Hashem
//Blessed is He

const { er } = require('../../general.js');
const { resolveVerseSection } = require('../commentReadSources.js');

/**
 * @module BinahCommentReadContext
 * @description
 * Binah turns scattered legacy query coordinates into one explicit read context before storage is touched.
 * The Awtsmoos renews every coordinate and every reader; Awtsmoos.com lets omission stay broad and zero stay exact,
 * so the query vessel clarifies intention without silently changing the caller's factual contract.
 */

/**
 * @description Builds a normalized comment-read context from explicit parameters and legacy GET fallbacks.
 * @param {object} params Legacy comment query parameters including `$i`.
 * @param {object} [options={}] Context-building options.
 * @param {boolean} [options.omitVerseSection=false] Excludes verse filtering for broad parent reads.
 * @returns {object} Normalized read coordinates suitable for comment read sources.
 * @throws {never} Missing values remain absent for explicit validation by {@link validateContext}.
 */
function buildContext(params, options = {}) {
	const $i = params.$i;
	const query = $i?.$_GET || {};
	const parentType = params.parentType || query.parentType || 'post';
	const context = {
		$i,
		aliasId: params.aliasId || query.aliasId,
		parentType,
		parentId: params.parentId || query.parentId,
		heichelId: params.heichelId || query.heichelId,
		postId: params.postId || (parentType === 'comment' ? query.postId : params.parentId),
		seriesId: params.seriesId || query.seriesId
	};
	if (!options.omitVerseSection) {
		const verseSection = resolveVerseSection($i, params.verseSection);
		if (verseSection !== undefined) {
			context.verseSection = verseSection;
		}
	}
	return context;
}

/**
 * @description Validates coordinates required by the selected legacy query family.
 * @param {object} context Normalized read context.
 * @param {object} [options={}] Validation options.
 * @param {boolean} [options.needAlias=false] Requires an alias coordinate when true.
 * @returns {object|null} Existing `er` garment when invalid, otherwise null.
 * @throws {never} Validation is pure and does not access persistence.
 */
function validateContext(context, options = {}) {
	const missing = [];
	if (options.needAlias && !context.aliasId) missing.push('aliasId');
	if (!context.parentId) missing.push('parentId');
	if (!context.heichelId) missing.push('heichelId');
	if (!context.seriesId) missing.push('seriesId');
	if (context.parentType === 'comment' && !context.postId) missing.push('postId');
	return missing.length ? er({ message: 'Missing required parameters', code: 'MISSING_PARAMS', missing, context: cleanContext(context) }) : null;
}

/**
 * @description Removes runtime request objects before a context is echoed inside an error response.
 * @param {object} context Normalized read context containing `$i` and public coordinates.
 * @returns {object} Serializable public coordinate subset.
 * @throws {never} Pure projection performs no IO.
 */
function cleanContext(context) {
	const { aliasId, parentType, parentId, heichelId, postId, seriesId } = context;
	return { aliasId, parentType, parentId, heichelId, postId, seriesId };
}

module.exports = {
	buildContext,
	cleanContext,
	validateContext
};
