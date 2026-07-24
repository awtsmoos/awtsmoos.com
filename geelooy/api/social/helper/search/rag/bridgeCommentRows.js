// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagBridgeCommentRows
 * @description
 * The running social database already owns the packed comments family. RAG asks
 * that bridge for one exact alias object at a time, resolving Meluket's friendly
 * post and its reviewed legacy aliases without opening another database session.
 */

const {
	getAliasCommentFilePath
} = require('../../comments/commentPaths.js');
const {
	flattenLegacy,
	normalizeComment
} = require('./commentRowShape.js');
const {
	sourceCoordinates
} = require('../../comments/imported/adapters/legacyAdapter.js');

const MELUKET_ALIASES = [
	'meluket_translation_en',
	'awtsmoosTranslations',
	'awtsmoos'
];

async function bridgeCommentRows(context = {}) {
	const database = context.$i?.db;
	if (typeof database?.get !== 'function') return [];
	return readBridgeAliases(database, context, resolvedCoordinates(context));
}

async function readBridgeAliases(database, context = {}, source = {}) {
	for (const aliasId of aliasCandidates(context, source)) {
		const filePath = bridgeCommentPath(context, source, aliasId);
		if (!filePath) continue;
		try {
			const value = await database.get(filePath, { max: true });
			const rows = rowsFromBridgeValue(value, context, source, aliasId);
			if (rows.length) return rows;
		} catch {
			continue;
		}
	}
	return [];
}

function aliasCandidates(context = {}, source = {}) {
	const aliases = [context.aliasId];
	if (source.mapped) aliases.push(...MELUKET_ALIASES);
	return [...new Set(aliases.filter(Boolean))];
}

function resolvedCoordinates(context = {}) {
	try {
		return sourceCoordinates(
			context.$i,
			context.seriesId,
			context.postId
		);
	} catch {
		return {
			seriesId: context.seriesId,
			postId: context.postId,
			mapped: null
		};
	}
}

function bridgeCommentPath(context = {}, source = resolvedCoordinates(context), aliasId = context.aliasId) {
	return getAliasCommentFilePath({
		...context,
		aliasId,
		seriesId: source.seriesId,
		parentId: source.postId,
		parentType: 'post'
	});
}

function rowsFromBridgeValue(value, context = {}, source = {}, sourceAlias = '') {
	return flattenLegacy(value)
		.map(row => normalizeComment(row, {
			...context,
			imported: true
		}))
		.filter(Boolean)
		.map(row => ({
			...row,
			seriesId: context.seriesId || row.seriesId,
			postId: context.postId || row.postId,
			ragCommentSource: 'awtsmoosDbFamilyBridge',
			ragCommentSourceAlias: sourceAlias || context.aliasId,
			ragCommentMappedFrom: source.mapped || undefined
		}));
}

module.exports = {
	MELUKET_ALIASES,
	aliasCandidates,
	bridgeCommentPath,
	bridgeCommentRows,
	readBridgeAliases,
	resolvedCoordinates,
	rowsFromBridgeValue
};
