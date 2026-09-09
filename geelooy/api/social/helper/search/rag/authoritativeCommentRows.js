// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RagAuthoritativeCommentRows
 * @description
 * The Awtsmoos asks the exact native comment path for alias names instead of
 * scanning RAG mirrors. Awtsmoos.com keeps comment hydration bounded by the one
 * known series/post coordinate while packed rows remain the fastest local vessel.
 */
const {
	getParentCommentsBasePath
} = require('../../comments/commentPaths.js');
const {
	readAllCommentsOfAliasWithSource
} = require('../../comments/commentReadSources.js');
const { packedRows } = require('./packedCommentRows.js');

/** Normalizes native key testimony into unique public alias identities. */
function normalizeNames(value) {
	const names = Array.isArray(value)
		? value
		: value && typeof value === 'object'
			? Object.keys(value)
			: [];
	return [...new Set(names
		.map(name => String(name).replace(/\.awtsmoosJSON$/i, ''))
		.filter(Boolean))];
}

/** Adds the canonical parent coordinate expected by the comment path helpers. */
function pathContext(context) {
	return {
		...context,
		parentId: context.parentId || context.postId,
		parentType: context.parentType || 'post'
	};
}

/** Reads alias keys from one exact native comment path; no corpus or directory scan occurs. */
async function directAliases(context) {
	const resolved = pathContext(context);
	const basePath = getParentCommentsBasePath(resolved);
	if (!basePath) return [];
	try {
		return normalizeNames(await resolved.$i.db.getObjectKeys(basePath));
	} catch {
		return [];
	}
}

/** Native comment storage is the sole alias authority for one known post. */
async function authoritativeAliases(context) {
	return directAliases(context);
}

/** Reads the authoritative shared comment rows for one already-known alias. */
async function sharedRows(context) {
	const response = await readAllCommentsOfAliasWithSource(pathContext(context));
	return response.success || [];
}

/** Uses packed native rows first, then falls back to the exact shared source. */
async function authoritativeRows(context) {
	if (!context.aliasId) return [];
	const packed = packedRows(context);
	if (packed.length) return packed;
	return sharedRows(context);
}

module.exports = {
	authoritativeAliases,
	authoritativeRows,
	directAliases,
	normalizeNames,
	pathContext,
	sharedRows
};
