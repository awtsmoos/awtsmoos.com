// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCommentSources
 * @description
 * Resolves the authoritative DosDB comment path first, then rich comments, then
 * imported history. The Awtsmoos preserves one truth through several vessels,
 * and Awtsmoos.com never scans an older ocean while the living path answers.
 */

const {
	authoritativeAliases,
	authoritativeRows
} = require('./authoritativeCommentRows.js');
const { legacyRows } = require('./legacyCommentRows.js');
const {
	directRichComment,
	richRowsForPost
} = require('./richCommentRows.js');

async function findCommentsForPostAlias(context) {
	const authoritative = await authoritativeRows(context);
	if (authoritative.length) return authoritative;
	const richRows = await richRowsForPost(context);
	if (richRows.length) return richRows;
	return legacyRows(context);
}

async function findAliasesForPost(context) {
	const authoritative = await authoritativeAliases(context);
	if (authoritative.length) return authoritative;
	const rows = await richRowsForPost({ ...context, aliasId: '' });
	if (rows.length) return uniqueAliases(rows);
	return uniqueAliases(await legacyRows({ ...context, aliasId: '' }));
}

function uniqueAliases(rows) {
	return [...new Set(rows.map(row => row.aliasId).filter(Boolean))];
}

async function findCommentById(context) {
	const rows = await findCommentsForPostAlias(context);
	const comment = rows.find(row => String(row.id) === String(context.commentId));
	if (comment) {
		return {
			success: comment,
			source: comment.ragCommentSource || 'awtsmoosDbCommentSource'
		};
	}
	const rich = await directRichComment(context, context.commentId);
	if (rich) return { success: rich, source: 'commentTree' };
	return {
		error: {
			code: 'COMMENT_NOT_FOUND',
			message: 'Comment not found in authoritative, rich, or imported sources.'
		}
	};
}

module.exports = {
	findAliasesForPost,
	findCommentById,
	findCommentsForPostAlias,
	uniqueAliases
};
