//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module RichCommentReaderCore
 * @description Reader primitives and reply expansion (split from richCommentReader.js, verbatim).
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

module.exports = {
	array,
	present,
	integer,
	same,
	context,
	expandReplies,
};
