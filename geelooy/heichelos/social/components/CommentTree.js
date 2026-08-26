// B"H
import { h } from './render.js';

/**
 * @module CommentTree
 * @description
 * Malchus reveals recursive discussion without allowing depth to become visual
 * chaos. The renderer preserves every reply while CSS controls indentation and
 * narrow-screen containment beneath the localized social root.
 */
export function CommentTree(malchusComments = []) {
	const malchusChildren = malchusComments.length
		? malchusComments.map(renderCommentNode)
		: [h('p', { class: 'awt-empty' }, ['No comments yet.'])];
	return h('section', {
		class: 'awt-panel awt-comment-tree',
		'aria-label': 'Discussion'
	}, malchusChildren);
}

/**
 * Renders one comment and its replies recursively.
 * @param {object} malchusComment - Comment-like record.
 * @returns {object} Comment blueprint.
 */
function renderCommentNode(malchusComment = {}) {
	return h('article', { class: 'awt-comment' }, [
		h('strong', { class: 'awt-comment-author' }, [malchusComment.author || 'Alias']),
		h('p', { class: 'awt-comment-copy' }, [malchusComment.text || '...']),
		...(malchusComment.replies || []).map(renderCommentNode)
	]);
}
