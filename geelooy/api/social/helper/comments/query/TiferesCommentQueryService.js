//B"H
//Boruch Hashem
//Blessed is He

const { er } = require('../../general.js');
const {
	readCommentsWithSource,
	readAllCommentsOfAliasWithSource,
	readVerseSectionsWithSource,
	readAuthorsWithSource
} = require('../commentReadSources.js');
const { buildContext, validateContext } = require('./BinahCommentReadContext.js');

/**
 * @module TiferesCommentQueryService
 * @description
 * Tiferes joins normalized coordinates to authoritative read sources while keeping every query family distinct.
 * The Awtsmoos renews broad parent and exact verse in one truth; Awtsmoos.com lets each reader keep its name,
 * so source metadata remains visible and compatibility arrives without disguising every query as the same.
 */

/**
 * @description Reads one alias at an exact verse coordinate using authoritative source selection.
 * @param {object} params Legacy query parameters including `$i` and comment coordinates.
 * @returns {Promise<object>} Source-aware read result or legacy validation error.
 * @throws {Error} Propagates unexpected read-source failures to the route boundary.
 */
async function getCommentsByAliasAtVerseSection(params) {
	const context = buildContext(params);
	return validatedRead(context, { needAlias: true }, readCommentsWithSource);
}

/**
 * @description Reads all comments by one alias beneath a parent without verse filtering.
 * @param {object} params Legacy query parameters including `$i` and parent coordinates.
 * @returns {Promise<object>} Source-aware broad alias result or validation error.
 * @throws {Error} Propagates unexpected read-source failures.
 */
async function getAllCommentsByAliasInParent(params) {
	const context = buildContext(params, { omitVerseSection: true });
	return validatedRead(context, { needAlias: true }, readAllCommentsOfAliasWithSource);
}

/**
 * @description Lists verse sections where one alias has commented beneath a parent.
 * @param {object} params Legacy query parameters.
 * @returns {Promise<object>} Source-aware verse-section result or validation error.
 * @throws {Error} Propagates unexpected read-source failures.
 */
async function getVerseSectionsCommentedByAuthorInParent(params) {
	const context = buildContext(params, { omitVerseSection: true });
	return validatedRead(context, { needAlias: true }, readVerseSectionsWithSource);
}

/**
 * @description Lists authors participating at an exact verse coordinate without requiring an alias filter.
 * @param {object} params Legacy query parameters.
 * @returns {Promise<object>} Source-aware author result or validation error.
 * @throws {Error} Propagates unexpected read-source failures.
 */
async function getAuthorsCommentingAtVerseSectionInParent(params) {
	const context = buildContext(params);
	return validatedRead(context, { needAlias: false }, readAuthorsWithSource);
}

/**
 * @description Finds one comment by ID inside the alias/verse result while retaining source metadata.
 * @param {object} params Legacy query parameters including `commentId` or GET fallback.
 * @returns {Promise<object|null>} Matching comment with source metadata, error garment, or null when absent.
 * @throws {Error} Propagates unexpected lower read failures.
 */
async function getComment(params) {
	const commentId = params.commentId || params.$i?.$_GET?.commentId;
	if (!commentId) {
		return er({ message: 'Missing required parameter: commentId', code: 'MISSING_PARAMS' });
	}
	const result = await getCommentsByAliasAtVerseSection(params);
	if (result?.error || !Array.isArray(result?.success)) {
		return result?.error || null;
	}
	const found = result.success.find((comment) => comment?.id === commentId);
	return found ? { ...found, awtsmoosCommentRead: result.awtsmoosCommentRead } : null;
}

/**
 * @description Applies common context validation before invoking one authoritative read function.
 * @param {object} context Normalized read coordinates.
 * @param {object} options Validation options passed to `validateContext`.
 * @param {Function} reader Async authoritative source function.
 * @returns {Promise<object>} Validation error or reader result.
 * @throws {Error} Propagates reader failures unchanged.
 */
async function validatedRead(context, options, reader) {
	const invalid = validateContext(context, options);
	return invalid || reader(context);
}

module.exports = {
	getAllCommentsByAliasInParent,
	getAuthorsCommentingAtVerseSectionInParent,
	getComment,
	getCommentsByAliasAtVerseSection,
	getVerseSectionsCommentedByAuthorInParent,
	validatedRead
};
