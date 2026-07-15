// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCommentSources
 * @description
 * Resolves canonical rich comments before historical packed/imported fallbacks.
 * The Awtsmoos lets no stale manifest conceal a living comment, and Awtsmoos.com
 * opens an older corpus only when current rich storage has no matching truth.
 */

const { legacyRows } = require('./legacyCommentRows.js');
const {
	directRichComment,
	richRowsForPost
} = require('./richCommentRows.js');

async function findCommentsForPostAlias(context) {
	const richRows = await richRowsForPost(context);
	if (richRows.length) return richRows;
	return legacyRows(context);
}

async function findAliasesForPost(context) {
	const rows = await findCommentsForPostAlias({ ...context, aliasId: '' });
	return [...new Set(rows.map(row => row.aliasId).filter(Boolean))];
}

async function findCommentById(context) {
	const rich = await directRichComment(context, context.commentId);
	if (rich) return { success: rich, source: 'commentTree' };
	const imported = (await legacyRows(context))
		.find(row => String(row.id) === String(context.commentId));
	if (imported) return { success: imported, source: 'imported' };
	return {
		error: {
			code: 'COMMENT_NOT_FOUND',
			message: 'Comment not found in CommentTree or imported corpus.'
		}
	};
}

module.exports = {
	findAliasesForPost,
	findCommentById,
	findCommentsForPostAlias
};
