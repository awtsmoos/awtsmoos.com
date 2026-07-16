// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagRichCommentRows
 * @description
 * Lists canonical comment folders once, then reads their bodies directly in small
 * batches. The Awtsmoos reveals every root and reply without recursive wandering,
 * and Awtsmoos.com never opens a packed corpus when rich truth already exists.
 */

const richPaths = require('../../comments/richCommentPaths.js');
const {
	filterContext,
	normalizeComment
} = require('./commentRowShape.js');

const READ_BATCH_SIZE = 32;

async function safeGet($i, target) {
	try {
		return await $i.db.get(target);
	} catch {
		return null;
	}
}

async function safeKeys($i, target) {
	try {
		return normalizeKeys(await $i.db.getObjectKeys(target));
	} catch {
		return [];
	}
}

function normalizeKeys(value) {
	const values = Array.isArray(value)
		? value
		: value && typeof value === 'object'
			? Object.keys(value)
			: [];
	return [...new Set(values
		.map(name => String(name).replace(/\.awtsmoosJSON$/i, ''))
		.filter(Boolean))];
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
	const commentIds = await safeKeys(context.$i, richPaths.commentsRoot({
		heichelId: context.heichelId || 'ikar',
		postId: context.postId
	}));
	const rows = [];
	for (let offset = 0; offset < commentIds.length; offset += READ_BATCH_SIZE) {
		const batch = commentIds.slice(offset, offset + READ_BATCH_SIZE);
		rows.push(...await Promise.all(
			batch.map(commentId => directRichComment(context, commentId))
		));
	}
	return filterContext(rows.filter(Boolean), context);
}

module.exports = {
	directRichComment,
	normalizeKeys,
	richRowsForPost
};
