// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagAuthoritativeCommentRows
 * @description
 * Derives aliases from existing RAG mirrors before touching database directories,
 * then reads known aliases by exact packed-object path. The Awtsmoos avoids every
 * directory ocean while Awtsmoos.com creates no persistent lookup index.
 */

const {
	getParentCommentsBasePath
} = require('../../comments/commentPaths.js');
const {
	readAllCommentsOfAliasWithSource
} = require('../../comments/commentReadSources.js');
const { metadataAliases } = require('./ragMetadataIndex.js');
const { packedRows } = require('./packedCommentRows.js');

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

function pathContext(context) {
	return {
		...context,
		parentId: context.parentId || context.postId,
		parentType: context.parentType || 'post'
	};
}

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

async function authoritativeAliases(context) {
	const indexed = await metadataAliases(context);
	if (indexed.length) return indexed;
	return directAliases(context);
}

async function sharedRows(context) {
	const response = await readAllCommentsOfAliasWithSource(pathContext(context));
	return response.success || [];
}

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
