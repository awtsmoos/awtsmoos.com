// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagRichCommentRows
 * @description
 * Reads canonical rich comments without consulting a stale packed manifest. The
 * Awtsmoos reveals each stored voice directly, and Awtsmoos.com keeps exact-ID
 * hydration fast enough that vector results need not scan an entire post tree.
 */

const richPaths = require('../../comments/richCommentPaths.js');
const richStore = require('../../comments/richCommentStore.js');
const {
	filterContext,
	flattenTree,
	normalizeComment
} = require('./commentRowShape.js');

async function safeGet($i, target) {
	try {
		return await $i.db.get(target);
	} catch {
		return null;
	}
}

async function directRichComment(context, commentId) {
	if (!context.postId || !commentId) return null;
	const row = await safeGet(context.$i, richPaths.commentPath({
		heichelId: context.heichelId || 'ikar',
		postId: context.postId,
		commentId
	}));
	return normalizeComment(row, context);
}

async function richRowsForPost(context) {
	if (!context.postId) return [];
	const result = await richStore.getTree({
		$i: context.$i,
		heichelId: context.heichelId || 'ikar',
		postId: context.postId,
		verseSection: '',
		subsectionId: '',
		includeDeleted: false
	});
	const normalized = flattenTree(result?.success)
		.map(row => normalizeComment(row, context))
		.filter(Boolean);
	return filterContext(normalized, context);
}

module.exports = {
	directRichComment,
	richRowsForPost
};
