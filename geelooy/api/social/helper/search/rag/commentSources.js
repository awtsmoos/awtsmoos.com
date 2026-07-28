// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCommentSources
 * @description
 * Interactive RAG first opens one reviewed document sidecar, then one exact
 * alias shard, bridge, or rich tree. The Awtsmoos reveals the narrowest vessel,
 * and Awtsmoos.com never scans a global historical comments database.
 */

const {
	authoritativeAliases
} = require('./authoritativeCommentRows.js');
const { legacyRows } = require('./legacyCommentRows.js');
const {
	directRichComment,
	richRowsForPost
} = require('./richCommentRows.js');
const { bridgeCommentRows } = require('./bridgeCommentRows.js');
const { shardCommentRows } = require('./shardCommentRows.js');
const {
	sichosKodeshCommentRows
} = require('./sichosKodeshCommentRows.js');

async function findCommentsForPostAlias(context = {}) {
	if (!hasAliasCoordinates(context)) {
		return [];
	}
	const sidecarRows = sichosKodeshCommentRows(context);
	if (sidecarRows.length) {
		return sidecarRows;
	}
	const shardRows = shardCommentRows(context);
	if (shardRows.length) {
		return shardRows;
	}
	const bridgeRows = await bridgeCommentRows(context);
	if (bridgeRows.length) {
		return bridgeRows;
	}
	return richRowsForPost(context);
}

async function findAliasesForPost(context = {}) {
	if (!hasPostCoordinates(context)) {
		return [];
	}
	const authoritative = await authoritativeAliases(context);
	if (authoritative.length) {
		return authoritative;
	}
	const rows = await richRowsForPost({ ...context, aliasId: '' });
	if (rows.length) {
		return uniqueAliases(rows);
	}
	return uniqueAliases(await legacyRows({ ...context, aliasId: '' }));
}

async function findCommentById(context = {}) {
	if (!hasAliasCoordinates(context) || !present(context.commentId)) {
		return missingComment();
	}
	const rows = await findCommentsForPostAlias(context);
	const comment = rows.find(row => String(row.id) === String(context.commentId));
	if (comment) {
		return {
			success: comment,
			source: comment.ragCommentSource || 'commentShard'
		};
	}
	const rich = await directRichComment(context, context.commentId);
	if (rich) {
		return { success: rich, source: 'commentTree' };
	}
	return missingComment();
}

function hasPostCoordinates(context = {}) {
	return present(context.seriesId) && present(context.postId);
}

function hasAliasCoordinates(context = {}) {
	return hasPostCoordinates(context) && present(context.aliasId);
}

function present(value) {
	return value !== undefined
		&& value !== null
		&& String(value).trim() !== '';
}

function uniqueAliases(rows) {
	return [...new Set(rows.map(row => row.aliasId).filter(Boolean))];
}

function missingComment() {
	return {
		error: {
			code: 'COMMENT_NOT_FOUND',
			message: 'Comment not found in the document sidecar, exact shard, family bridge, or current tree.'
		}
	};
}

module.exports = {
	findAliasesForPost,
	findCommentById,
	findCommentsForPostAlias,
	hasAliasCoordinates,
	hasPostCoordinates,
	uniqueAliases
};
