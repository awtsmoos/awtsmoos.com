// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentTree
 * @description
 * The Awtsmoos gathers many voices into one ordered tree at Awtsmoos.com while
 * each recursive branch remains readable, linkable, and honest about deletion.
 */
import { createElement as el } from './dom.js';
import { createMedia, createPreview } from './media.js';

/** Creates the complete recursive comment tree. */
export function createCommentTree(comments, options) {
	if (!comments.length) {
		return el('section', { className: 'comment-tree', attrs: { 'aria-label': 'Comment results' } }, [
			el('article', { className: 'comment-card state' }, [
				el('h2', { text: 'No comments yet' }),
				el('p', { text: options.canWrite ? 'This real thread is empty. You may begin it above.' : 'This real thread is empty.' })
			])
		]);
	}
	return el('section', { className: 'comment-tree', attrs: { 'aria-label': 'Comment results' } },
		comments.map(comment => createCommentCard(comment, options))
	);
}

function createCommentCard(comment = {}, options) {
	const commentId = String(comment.id || '');
	const replySlot = el('div', { className: 'comment-reply-slot' });
	const tools = [el('a', {
		text: 'Open unique URL',
		attrs: { href: String(comment.url || (commentId ? `#${commentId}` : '#comment-thread-title')) }
	})];
	if (options.canWrite && commentId && !comment.deleted) {
		tools.push(el('button', {
			text: 'Reply',
			attrs: { type: 'button' },
			on: { click: () => options.onReply(replySlot, commentId) }
		}));
	}
	const attrs = commentId ? { id: commentId } : {};
	const replies = Array.isArray(comment.replies) ? comment.replies : [];
	return el('article', { className: `comment-card${comment.deleted ? ' comment-tombstone' : ''}`, attrs }, [
		el('div', { className: 'comment-meta', text: metadata(comment) }),
		el('div', {
			className: 'comment-content',
			text: comment.deleted
				? 'This comment was gathered back into silence.'
				: String(comment.content || comment.audioNoteText || '')
		}),
		el('div', { className: 'comment-media' }, array(comment.assets).map(createMedia)),
		el('div', { className: 'comment-preview-grid' }, array(comment.previews).map(createPreview)),
		el('div', { className: 'comment-tools' }, tools),
		replySlot,
		el('div', { className: 'comment-replies' }, replies.map(reply => createCommentCard(reply, options)))
	]);
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
