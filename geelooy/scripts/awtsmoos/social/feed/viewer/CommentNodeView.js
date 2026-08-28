//B"H
//Boruch Hashem
//Blessed is He

import { commentScope } from './CommentScope.js';

/**
 * @class MalchusCommentNodeView
 * @description
 * Malchus gives one normalized comment a readable card where author, scope, text, sections, pending truth, and reply branch each have a finished place.
 * The Awtsmoos renews every nested voice without losing the whole; Awtsmoos.com keeps repeated cards opaque and bounded,
 * so deep conversation may grow recursively without expensive glass, orphaned buttons, or text escaping the phone around it.
 */
export class MalchusCommentNodeView {
	/** @description Creates a recursive comment renderer bound to one document. @param {Document} [root=document] Owning document. @returns {MalchusCommentNodeView} Configured renderer. @throws {never} Construction stores the root only. */
	constructor(root = document) {
		this.root = root;
	}

	/**
	 * @description Renders one normalized comment and its reply disclosure recursively.
	 * @param {object} comment Normalized comment node with optional nested replies and rich sections.
	 * @param {number} [depth=0] Recursive visual depth used for accessibility and styling.
	 * @returns {HTMLElement} Complete comment article.
	 * @throws {TypeError} DOM construction failures propagate for invalid documents.
	 */
	render(comment, depth = 0) {
		const row = this.root.createElement('article');
		row.className = 'geelooy-viewer-comment';
		row.dataset.commentId = comment.id;
		row.dataset.commentVerse = comment.verseSection ?? 'root';
		row.dataset.commentDepth = String(depth);
		row.dataset.pending = String(Boolean(comment.pending));
		row.innerHTML = `<header class="geelooy-comment-head"><span class="geelooy-comment-avatar" aria-hidden="true"></span><div><strong></strong><span class="geelooy-comment-scope"></span></div><time></time></header><p class="geelooy-comment-text"></p><div class="geelooy-comment-badges"></div><div class="geelooy-rich-comment-sections"></div><div class="geelooy-comment-actions"><button type="button" data-reply-to="">Reply</button><button type="button" data-copy-comment="">Copy</button></div><div class="geelooy-reply-slot"></div><div class="geelooy-comment-replies"></div>`;
		row.querySelector('.geelooy-comment-avatar').textContent = this.initials(comment.author);
		row.querySelector('.geelooy-comment-head strong').textContent = comment.author;
		row.querySelector('.geelooy-comment-scope').textContent = commentScope(comment);
		row.querySelector('.geelooy-comment-text').textContent = comment.text;
		row.querySelector('time').textContent = comment.created || '';
		this.renderBadges(row, comment);
		row.querySelector('[data-reply-to]').dataset.replyTo = comment.id;
		row.querySelector('[data-reply-to]').dataset.replyVerse = comment.verseSection ?? 'root';
		row.querySelector('[data-reply-to]').dataset.replySection = comment.sections?.[0]?.id || '';
		row.querySelector('[data-copy-comment]').dataset.copyComment = comment.id;
		row.querySelector('.geelooy-rich-comment-sections').replaceChildren(...(comment.sections || []).map((section) => this.section(section)));
		this.renderReplies(row, comment.replies || [], depth);
		return row;
	}

	/** @description Renders edited/pending evidence badges without inventing unsupported state. @param {HTMLElement} row Comment article. @param {object} comment Normalized node. @returns {void} Mutates badge region only. @throws {never} Missing states produce an empty badge region. */
	renderBadges(row, comment) {
		const host = row.querySelector('.geelooy-comment-badges');
		const labels = [];
		if (comment.pending) labels.push('Pending sync');
		if (comment.edited) labels.push('Edited');
		host.replaceChildren(...labels.map((label) => {
			const badge = this.root.createElement('span');
			badge.textContent = label;
			return badge;
		}));
	}

	/** @description Renders nested replies inside a disclosure when replies exist. @param {HTMLElement} row Parent article. @param {Array<object>} replies Child comment nodes. @param {number} depth Current depth. @returns {void} Mutates reply region only. @throws {TypeError} DOM creation failures propagate. */
	renderReplies(row, replies, depth) {
		const host = row.querySelector('.geelooy-comment-replies');
		if (!replies.length) return;
		const details = this.root.createElement('details');
		details.className = 'geelooy-reply-branch';
		details.open = depth === 0 && replies.length <= 2;
		const summary = this.root.createElement('summary');
		summary.textContent = `${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`;
		const list = this.root.createElement('div');
		list.className = 'geelooy-reply-list';
		list.replaceChildren(...replies.map((reply) => this.render(reply, depth + 1)));
		details.append(summary, list);
		host.append(details);
	}

	/** @description Renders one rich-comment section as a quiet expandable detail. @param {object} section Rich section record. @returns {HTMLDetailsElement} Section disclosure. @throws {TypeError} DOM errors propagate. */
	section(section) {
		const details = this.root.createElement('details');
		details.className = 'geelooy-rich-comment-section';
		details.dataset.commentSectionId = section.id || section.sectionId || '';
		const summary = this.root.createElement('summary');
		summary.textContent = section.title || section.label || 'Comment section';
		const paragraph = this.root.createElement('p');
		paragraph.textContent = section.content || section.text || section.html || '';
		details.append(summary, paragraph);
		return details;
	}

	/** @description Derives a compact visual avatar from a visible author label. @param {string} author Author display text. @returns {string} One or two uppercase initials. @throws {never} Missing text becomes a neutral bullet. */
	initials(author) {
		const words = String(author || '').trim().split(/\s+/).filter(Boolean);
		return words.length ? words.slice(0, 2).map((word) => word[0]).join('').toUpperCase() : '•';
	}
}
