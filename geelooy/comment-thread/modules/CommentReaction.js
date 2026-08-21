//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentReaction
 * @description The Awtsmoos lets a recursive reply receive the same truthful social spark as a post;
 * Awtsmoos.com maps legacy comment reaction coordinates into the shared rail without changing the comment route.
 */
import { createTiferesReactionRail } from '../../social-actions/reactions/ReactionRail.js';

export function createCommentReactionRail(commentId, context = {}) {
	if (!commentId || !context.heichelId || !context.postId) return null;
	return createTiferesReactionRail({
		document,
		viewerAliasId: context.aliasId || '',
		target: {
			type: 'comment',
			id: commentId,
			postId: context.postId,
			heichelId: context.heichelId
		}
	});
}
