//B"H
//Boruch Hashem
//Blessed is He

import { fetchCommentTree, createReply, createRootComment } from '../commentApi.js?v=comments-020';
import { BinahCommentThreadView } from './CommentThreadView.js';

/**
 * @class TiferesCommentThreadController
 * @description
 * Tiferes joins real comment transport, local degraded truth, sorting, scoped forms, and refresh into one conversation lifecycle.
 * The Awtsmoos renews request and rendering without making either self-sufficient; Awtsmoos.com keeps mutations busy, errors visible, and branches calm,
 * so a failed network can preserve a user's word while a healthy server remains the only canonical psalm.
 */
export class TiferesCommentThreadController {
	/**
	 * @description Creates a thread controller around the viewer conversation host.
	 * @param {HTMLElement} host Dedicated conversation region.
	 * @param {Document} [root=document] Owning document used for event delegation and reply forms.
	 * @returns {TiferesCommentThreadController} Configured controller ready for `bind` and `load`.
	 * @throws {never} Construction stores state and creates the view only.
	 */
	constructor(host, root = document) {
		this.host = host;
		this.root = root;
		this.view = new BinahCommentThreadView(root);
		this.object = null;
		this.tree = [];
		this.view.mount(host);
	}

	/** @description Binds sorting, root/reply submit, reply-open, copy, and input-count behaviors once. @returns {void} Registers host-local delegated listeners. @throws {TypeError} DOM listener errors propagate for invalid hosts. */
	bind() {
		this.host.addEventListener('change', (event) => this.change(event));
		this.host.addEventListener('click', (event) => this.click(event));
		this.host.addEventListener('submit', (event) => void this.submit(event));
		this.host.addEventListener('input', (event) => this.input(event));
	}

	/**
	 * @description Loads and renders the real comment tree for one normalized feed object.
	 * @param {object} object Normalized feed object containing post coordinates.
	 * @returns {Promise<Array<object>>} Loaded nested tree retained as the controller's current truth.
	 * @throws {never} The API facade already translates network failure into pending fallback or empty state.
	 */
	async load(object) {
		this.object = object;
		this.view.status(this.host, 'Loading conversation…');
		this.tree = await fetchCommentTree(object);
		this.view.render(this.host, this.tree);
		return this.tree;
	}

	/** @description Handles sort changes without refetching canonical data. @param {Event} event Delegated change event. @returns {boolean} Whether a sort control was handled. @throws {never} Unknown changes are ignored. */
	change(event) {
		const select = event.target.closest('[data-comment-sort]');
		if (!select) return false;
		this.view.sortMode = select.value;
		this.view.render(this.host, this.tree);
		return true;
	}

	/** @description Handles reply form disclosure and copy-comment actions. @param {MouseEvent} event Delegated click event. @returns {boolean} Whether a known action was handled. @throws {never} Clipboard rejection is not allowed to break the conversation. */
	click(event) {
		const reply = event.target.closest('[data-reply-to]');
		if (reply) {
			this.showReplyForm(reply);
			return true;
		}
		const copy = event.target.closest('[data-copy-comment]');
		if (copy) {
			void navigator.clipboard?.writeText(`${location.href}#comment-${copy.dataset.copyComment}`);
			this.view.status(this.host, 'Comment link copied');
			return true;
		}
		return false;
	}

	/** @description Routes root or reply form submission through the canonical API facade and reloads the resulting tree. @param {SubmitEvent} event Delegated submit event. @returns {Promise<boolean>} Whether a known form was submitted. @throws {never} API errors are already translated into canonical or degraded results. */
	async submit(event) {
		if (!this.object) return false;
		const form = event.target;
		if (!form.matches('[data-viewer-comment-form], [data-viewer-reply-form]')) return false;
		event.preventDefault();
		const input = form.elements.comment || form.elements.reply;
		const text = String(input?.value || '').trim();
		if (!text) return false;
		form.dataset.busy = 'true';
		this.view.status(this.host, 'Publishing comment…');
		const result = form.matches('[data-viewer-reply-form]')
			? await createReply(this.object, form.dataset.viewerReplyForm, text, {
				verseSection: form.dataset.replyVerse || 'root',
				sectionId: form.dataset.replySection || ''
			})
			: await createRootComment(this.object, text, { verseSection: 'root' });
		input.value = '';
		delete form.dataset.busy;
		this.view.status(this.host, result?.degraded ? 'Saved locally. Will need sync when connection returns.' : 'Comment published');
		await this.load(this.object);
		return true;
	}

	/** @description Updates the root composer character count without altering text. @param {InputEvent} event Delegated input event. @returns {void} Updates count when the root textarea changes. @throws {never} Unknown inputs are ignored. */
	input(event) {
		if (event.target.name !== 'comment') return;
		const count = this.host.querySelector('[data-comment-count]');
		if (count) count.textContent = `${event.target.value.length} / 5000`;
	}

	/** @description Opens one compact reply composer inside the selected comment card. @param {HTMLElement} button Reply action carrying comment/verse/section datasets. @returns {void} Replaces only that card's reply slot. @throws {never} Missing slots are ignored. */
	showReplyForm(button) {
		const card = button.closest('[data-comment-id]');
		const host = card?.querySelector(':scope > .geelooy-reply-slot');
		if (!host) return;
		host.innerHTML = `<form class="geelooy-inline-reply" data-viewer-reply-form="${button.dataset.replyTo}" data-reply-verse="${button.dataset.replyVerse || 'root'}" data-reply-section="${button.dataset.replySection || ''}"><label><span>Reply</span><textarea name="reply" rows="2" maxlength="5000"></textarea></label><div><button type="submit">Reply</button><button type="button" data-cancel-reply>Cancel</button></div></form>`;
		host.querySelector('textarea')?.focus();
	}
}
