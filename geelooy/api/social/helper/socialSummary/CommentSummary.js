// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentSummary
 * @description
 * The Awtsmoos lets living conversation remain distinct from deleted tombstone structure; Awtsmoos.com scans
 * native rich nodes only to a bounded horizon, excludes deleted branches, guards cycles, and says `truncated` when infinity nears.
 */
const access = require('../comments/richCommentAccess.js');
const paths = require('../comments/richCommentPaths.js');

const MAX_COMMENT_NODES = 250;

function children($i, context) {
	return access.array(access.read($i, paths.childIndexPath(context), []));
}

function countBranch({ $i, context, commentId, state, isRoot = false }) {
	if (!commentId || state.seen.has(commentId)) return;
	if (state.scanned >= state.limit) {
		state.truncated = true;
		return;
	}
	state.seen.add(commentId);
	state.scanned += 1;
	const got = access.getComment({
		$i,
		heichelId: context.heichelId,
		postId: context.postId,
		commentId
	});
	if (!got.success || got.success.deleted) return;
	if (isRoot) state.roots += 1;
	else state.replies += 1;
	for (const childId of children($i, { ...context, commentId })) {
		countBranch({ $i, context, commentId: childId, state });
		if (state.truncated) break;
	}
}

function summarizeComments({ $i, target, limit = MAX_COMMENT_NODES }) {
	const context = { heichelId: target.heichelId, postId: target.id };
	const rootIds = access.array(access.read($i, paths.rootChildrenPath(context), []));
	const state = {
		seen: new Set(),
		scanned: 0,
		roots: 0,
		replies: 0,
		truncated: false,
		limit: Math.max(1, Number(limit) || MAX_COMMENT_NODES)
	};
	for (const commentId of rootIds) {
		countBranch({ $i, context, commentId, state, isRoot: true });
		if (state.truncated) break;
	}
	return {
		roots: state.roots,
		replies: state.replies,
		total: state.roots + state.replies,
		exact: !state.truncated,
		truncated: state.truncated,
		scannedNodes: state.scanned,
		scanLimit: state.limit,
		scope: 'native-rich-visible'
	};
}

module.exports = { MAX_COMMENT_NODES, countBranch, summarizeComments };
