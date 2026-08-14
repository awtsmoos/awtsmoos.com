// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCommentReader
 * @description
 * The Awtsmoos lets native comment light enter only through its dedicated packed
 * indexes. Every page is bounded before bodies or reply branches are expanded.
 */
const paths = require('./richCommentPaths.js');
const access = require('./richCommentAccess.js');

function array(value) { return Array.isArray(value) ? value : []; }
function present(value) { return value !== '' && value !== undefined && value !== null; }
function integer(value, fallback, min, max) {
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
}
function same(left, right) { return String(left ?? '') === String(right ?? ''); }
function context(heichelId, postId, extra = {}) { return { heichelId, postId, ...extra }; }

async function expandReplies({ $i, comment, includeDeleted, depth, maxDepth, replyLimit, stats }) {
	const target = paths.childIndexPath(context(comment.heichelId, comment.postId, { commentId: comment.id }));
	const ids = array(access.read($i, target, []));
	if (depth >= maxDepth) {
		stats.truncatedReplies += ids.length;
		return { ...comment, replies: [] };
	}
	const selected = ids.slice(0, replyLimit);
	stats.truncatedReplies += Math.max(0, ids.length - selected.length);
	const replies = [];
	for (const id of selected) {
		const got = access.getComment({ $i, heichelId: comment.heichelId, postId: comment.postId, commentId: id });
		if (!got.success || (!includeDeleted && got.success.deleted)) continue;
		replies.push(await expandReplies({ $i, comment: got.success, includeDeleted, depth: depth + 1, maxDepth, replyLimit, stats }));
	}
	return { ...comment, replies };
}

function indexedIds({ $i, heichelId, postId, verseSection, subsectionId }) {
	if (present(subsectionId)) {
		const target = paths.subsectionIndexPath(context(heichelId, postId, { subsectionId }));
		return { index: 'subsection', ids: array(access.read($i, target, [])) };
	}
	if (present(verseSection)) {
		const target = paths.verseIndexPath(context(heichelId, postId, { verseSection }));
		return { index: 'verse', ids: array(access.read($i, target, [])) };
	}
	return { index: 'roots', ids: array(access.read($i, paths.rootChildrenPath(context(heichelId, postId)), [])) };
}

function matches(comment, verseSection, subsectionId) {
	if (comment.parentId) return false;
	if (present(verseSection) && !same(comment.verseSection, verseSection)) return false;
	if (present(subsectionId) && !same(comment.subsectionId, subsectionId)) return false;
	return true;
}

async function getTree({ $i, heichelId, postId, verseSection = '', subsectionId = '', includeDeleted = false, offset = 0, limit = 50, maxDepth = 5, replyLimit = 50 }) {
	offset = integer(offset, 0, 0, Number.MAX_SAFE_INTEGER);
	limit = integer(limit, 50, 1, 100);
	maxDepth = integer(maxDepth, 5, 0, 8);
	replyLimit = integer(replyLimit, 50, 1, 100);
	const source = indexedIds({ $i, heichelId, postId, verseSection, subsectionId });
	const stats = { scannedIds: 0, truncatedReplies: 0 };
	const out = [];
	let hasMore = false;
	if (source.index === 'roots') {
		const pageIds = source.ids.slice(offset, offset + limit);
		hasMore = offset + pageIds.length < source.ids.length;
		for (const id of pageIds) {
			stats.scannedIds++;
			const got = access.getComment({ $i, heichelId, postId, commentId: id });
			if (!got.success || (!includeDeleted && got.success.deleted)) continue;
			out.push(await expandReplies({ $i, comment: got.success, includeDeleted, depth: 0, maxDepth, replyLimit, stats }));
		}
	} else {
		let skipped = 0;
		for (let cursor = 0; cursor < source.ids.length; cursor++) {
			stats.scannedIds++;
			const got = access.getComment({ $i, heichelId, postId, commentId: source.ids[cursor] });
			if (!got.success || (!includeDeleted && got.success.deleted) || !matches(got.success, verseSection, subsectionId)) continue;
			if (skipped++ < offset) continue;
			out.push(await expandReplies({ $i, comment: got.success, includeDeleted, depth: 0, maxDepth, replyLimit, stats }));
			if (out.length >= limit) { hasMore = cursor + 1 < source.ids.length; break; }
		}
	}
	return { success: out, meta: { index: source.index, candidateIds: source.ids.length, returnedRootComments: out.length, offset, limit, hasMore, maxDepth, replyLimit, ...stats } };
}

async function getReplies({ $i, heichelId, postId, commentId, includeDeleted = false, offset = 0, limit = 50, maxDepth = 5, replyLimit = 50 }) {
	offset = integer(offset, 0, 0, Number.MAX_SAFE_INTEGER);
	limit = integer(limit, 50, 1, 100);
	const ids = array(access.read($i, paths.childIndexPath(context(heichelId, postId, { commentId })), []));
	const pageIds = ids.slice(offset, offset + limit);
	const stats = { scannedIds: 0, truncatedReplies: 0 };
	const out = [];
	for (const id of pageIds) {
		stats.scannedIds++;
		const got = access.getComment({ $i, heichelId, postId, commentId: id });
		if (!got.success || (!includeDeleted && got.success.deleted)) continue;
		out.push(await expandReplies({ $i, comment: got.success, includeDeleted, depth: 1, maxDepth: integer(maxDepth, 5, 1, 8), replyLimit: integer(replyLimit, 50, 1, 100), stats }));
	}
	return { success: out, meta: { index: 'children', candidateIds: ids.length, returnedComments: out.length, offset, limit, hasMore: offset + pageIds.length < ids.length, ...stats } };
}

module.exports = { getReplies, getTree, integer, present };
