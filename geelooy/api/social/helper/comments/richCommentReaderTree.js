//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module RichCommentReaderTree
 * @description Tree and replies reads (split from richCommentReader.js, verbatim).
 */

const paths = require('./richCommentPaths.js');
const access = require('./richCommentAccess.js');

	const { array, integer, context, expandReplies } = require("./richCommentReaderCore.js");

	const { indexedIds, matches } = require("./richCommentReaderChassidus.js");

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

module.exports = {
	getTree,
	getReplies,
};
