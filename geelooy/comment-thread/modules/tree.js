//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentTree
 * @description The Awtsmoos gathers many recursive voices into one conversation while Awtsmoos.com gives every visible branch
 * stable identity, persisted relation meaning, canonical reactions, universal actions, media, and honest tombstone silence.
 */
import { createCommentReactionRail } from './CommentReaction.js';
import { createCommentUniversalActions } from './CommentUniversalActions.js';
import { createElement as el } from './dom.js';
import { createMedia, createPreview } from './media.js';

export function createCommentTree(comments, options) {
	if (!comments.length) return emptyTree(options);
	return el('section', { className: 'comment-tree', attrs: { 'aria-label': 'Comment results' } },
		comments.map(comment => createCommentCard(comment, options))
	);
}

function emptyTree(options) {
	return el('section', { className: 'comment-tree', attrs: { 'aria-label': 'Comment results' } }, [
		el('article', { className: 'comment-card state' }, [
			el('h2', { text: 'No comments yet' }),
			el('p', { text: options.canWrite ? 'This real thread is empty. You may begin it above.' : 'This real thread is empty.' })
		])
	]);
}

function stableUrl(comment, commentId) {
	return String(comment.url || (commentId ? `#${commentId}` : '#comment-thread-title'));
}

function relationChips(comment) {
	return array(comment.links || comment.references)
		.filter(reference => reference?.relation)
		.map(reference => el('span', {
			className: 'commentRelationChip',
			text: String(reference.relation).replaceAll('_', ' ')
		}));
}

function createCommentCard(comment = {}, options) {
	const commentId = String(comment.id || comment.commentId || '');
	const replySlot = el('div', { className: 'comment-reply-slot' });
	const url = stableUrl(comment, commentId);
	const attrs = commentId
		? { id: commentId, tabindex: '-1', 'data-comment-id': commentId }
		: { tabindex: '-1' };
	const replies = array(comment.replies);
	const reactionRail = !comment.deleted ? createCommentReactionRail(commentId, options.reactionContext) : null;
	const actions = !comment.deleted ? createCommentUniversalActions({
		document,
		comment,
		url,
		canReply: options.canWrite,
		onRemember: options.onRemember,
		onReply: () => options.onReply(replySlot, commentId)
	}) : null;
	return el('article', { className: `comment-card${comment.deleted ? ' comment-tombstone' : ''}`, attrs }, [
		el('div', { className: 'comment-meta', text: metadata(comment) }),
		el('div', {
			className: 'comment-content',
			text: comment.deleted ? 'This comment was gathered back into silence.' : String(comment.content || comment.audioNoteText || '')
		}),
		el('div', { className: 'commentRelationList' }, relationChips(comment)),
		el('div', { className: 'comment-media' }, array(comment.assets).map(createMedia)),
		el('div', { className: 'comment-preview-grid' }, array(comment.previews).map(createPreview)),
		reactionRail,
		actions,
		replySlot,
		el('div', { className: 'comment-replies' }, replies.map(reply => createCommentCard(reply, options)))
	].filter(Boolean));
}

function metadata(comment) {
	const alias = comment.aliasId ? `@${comment.aliasId}` : 'Unknown alias';
	const verse = comment.verseSection || 'root';
	const subsection = comment.subsectionId ? ` / ${comment.subsectionId}` : '';
	return `${alias} · ${verse}${subsection}`;
}

function array(value) {
	return Array.isArray(value) ? value : [];
}

export { array, createCommentCard, emptyTree, metadata, relationChips, stableUrl };
