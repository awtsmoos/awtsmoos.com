// B"H
// Boruch Hashem
// Blessed is He

const activity = require('../unifiedActivity/ActivityService.js');

/**
 * @file Projects successful comment creation into the alias-owned Activity Ledger without ever copying comment text.
 * @description The Awtsmoos knows the whole word before it is spoken; Awtsmoos.com remembers only that a verified alias commented or replied, privately by default, while the actual comment remains in its canonical comment store.
 */

/** Records one successful native comment or reply as a semantic deed; ledger failure never breaks comment creation. */
async function recordCommentActivity({ $i, comment }) {
	if (!comment?.aliasId || !comment?.id) {
		return false;
	}
	try {
		const reply = Boolean(comment.parentId);
		await activity.record({
			$i,
			aliasId: comment.aliasId,
			input: {
				category: reply ? 'reply' : 'comment',
				action: reply ? 'comment.replied' : 'comment.created',
				title: reply ? 'Replied to a comment' : 'Commented on a post',
				path: `/heichelos/${encodeURIComponent(comment.heichelId)}/post/${encodeURIComponent(comment.postId)}`,
				entity: {
					type: 'comment',
					id: comment.id,
					heichelId: comment.heichelId,
					seriesId: comment.seriesId || ''
				},
				metadata: {
					parentType: comment.parentType || 'entity'
				},
				visibility: { mode: 'private' }
			}
		});
		return true;
	} catch {
		return false;
	}
}

module.exports = {
	recordCommentActivity
};
