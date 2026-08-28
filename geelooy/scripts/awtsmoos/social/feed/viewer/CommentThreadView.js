//B"H
//Boruch Hashem
//Blessed is He

import { commentSortTime } from './CommentScope.js';
import { MalchusCommentNodeView } from './CommentNodeView.js';

/**
 * @class BinahCommentThreadView
 * @description
 * Binah gives an entire conversation order without erasing its nested form: loading, empty, sorted roots, reply composition, and counts remain distinct.
 * The Awtsmoos renews each voice before the list can become stale; Awtsmoos.com lets the thread stay simple at first glance,
 * while sorting and branch disclosure reveal advanced depth only when a reader asks for another glance.
 */
export class BinahCommentThreadView {
	/** @description Creates a thread renderer around the owning document and recursive node view. @param {Document} [root=document] Owning document. @returns {BinahCommentThreadView} Configured renderer. @throws {never} Construction stores collaborators only. */
	constructor(root = document) {
		this.root = root;
		this.nodeView = new MalchusCommentNodeView(root);
		this.sortMode = 'newest';
	}

	/**
	 * @description Mounts the complete conversation header, sort controls, status, list, and root composer into the viewer region.
	 * @param {HTMLElement} host Conversation region.
	 * @returns {void} Replaces only the dedicated conversation region.
	 * @throws {TypeError} DOM errors propagate when host is invalid.
	 */
	mount(host) {
		host.innerHTML = `<header class="geelooy-conversation-head"><div><span>Conversation</span><h3>Comments</h3><p>Reply to the whole post, an exact verse, or a rich comment section.</p></div><label>Sort<select data-comment-sort><option value="newest">Newest</option><option value="oldest">Oldest</option></select></label></header><div class="geelooy-conversation-status" data-comment-status role="status" aria-live="polite"></div><div class="geelooy-comment-list" data-viewer-comments></div><form class="geelooy-root-comment-form" data-viewer-comment-form><label><span>Join the conversation</span><textarea name="comment" rows="3" maxlength="5000"></textarea></label><div><span data-comment-count>0 / 5000</span><button type="submit">Comment</button></div></form>`;
	}

	/**
	 * @description Renders sorted root comments, an honest empty state, and aggregate count without flattening replies.
	 * @param {HTMLElement} host Conversation region containing list/status controls.
	 * @param {Array<object>} tree Nested normalized root comment tree.
	 * @returns {number} Total recursive comment count displayed in the header status.
	 * @throws {TypeError} DOM errors propagate for malformed hosts.
	 */
	render(host, tree) {
		const list = host.querySelector('[data-viewer-comments]');
		const roots = this.sorted(tree);
		const total = this.count(tree);
		if (!roots.length) {
			const empty = this.root.createElement('div');
			empty.className = 'geelooy-comment-empty';
			empty.innerHTML = '<strong>No comments yet</strong><span>Start the real conversation. Nothing synthetic is inserted here.</span>';
			list.replaceChildren(empty);
		} else {
			list.replaceChildren(...roots.map((comment) => this.nodeView.render(comment)));
		}
		this.status(host, total ? `${total} ${total === 1 ? 'comment' : 'comments'}` : 'Conversation ready');
		return total;
	}

	/** @description Updates sorting mode and returns a newly ordered root array without mutating canonical tree state. @param {Array<object>} tree Nested root comment array. @returns {Array<object>} Root-level sorted copy. @throws {never} Unknown sort values preserve incoming order. */
	sorted(tree) {
		const roots = [...(Array.isArray(tree) ? tree : [])];
		if (this.sortMode === 'oldest') {
			return roots.sort((a, b) => commentSortTime(a) - commentSortTime(b));
		}
		if (this.sortMode === 'newest') {
			return roots.sort((a, b) => commentSortTime(b) - commentSortTime(a));
		}
		return roots;
	}

	/** @description Counts every root and nested reply recursively for an accurate conversation total. @param {Array<object>} nodes Nested comment nodes. @returns {number} Recursive node count. @throws {never} Missing reply arrays count as zero children. */
	count(nodes) {
		return (nodes || []).reduce((total, node) => total + 1 + this.count(node.replies || []), 0);
	}

	/** @description Publishes one concise conversation status message. @param {HTMLElement} host Conversation region. @param {string} message Human-readable status. @returns {void} Updates live region only. @throws {never} Missing status region is a safe no-op. */
	status(host, message) {
		const region = host.querySelector('[data-comment-status]');
		if (region) region.textContent = message;
	}
}
