// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CommentThreadRender
 * @description The Awtsmoos keeps reading and writing distinct at Awtsmoos.com.
 */
import { loadCommentTree, submitComment } from './api.js';
import { createComposer } from './composer.js';
import { createElement as el } from './dom.js';
import { createCommentTree } from './tree.js';

export class CommentThreadController {
	constructor(root, config) {
		this.root = root;
		this.config = config;
		this.comments = [];
	}

	async start() {
		if (!this.root) return;
		if (this.config.missingRead.length) {
			this.renderMissingContext();
			return;
		}
		this.renderLoading();
		try {
			this.comments = await loadCommentTree(this.config);
			this.renderThread();
		} catch (error) {
			this.renderError(error);
		}
	}

	renderThread() {
		const authorSurface = this.config.canWrite
			? createComposer(this.config, '', this.submit.bind(this))
			: readOnlyNotice();
		const tree = createCommentTree(this.comments, {
			canWrite: this.config.canWrite,
			onReply: this.openReply.bind(this)
		});
		this.root.replaceChildren(this.hero(), authorSurface, tree);
	}

	openReply(slot, parentId) {
		const existing = slot.querySelector('form');
		if (existing) {
			existing.querySelector('textarea')?.focus();
			return;
		}
		slot.append(createComposer(this.config, parentId, this.submit.bind(this)));
		slot.querySelector('textarea')?.focus();
	}

	async submit(form, parentId, status) {
		const button = form.querySelector('button[type="submit"]');
		if (button) button.disabled = true;
		form.setAttribute('aria-busy', 'true');
		status.textContent = 'Sending…';
		try {
			await submitComment(this.config, Object.fromEntries(new FormData(form)), parentId);
			this.comments = await loadCommentTree(this.config);
			this.renderThread();
		} catch (error) {
			status.textContent = error.message || 'The comment could not be sent.';
			if (button) button.disabled = false;
			form.setAttribute('aria-busy', 'false');
		}
	}

	hero() {
		const coordinate = this.config.subsectionId
			? ` · ${this.config.verseSection || 'root'} / ${this.config.subsectionId}`
			: this.config.verseSection ? ` · ${this.config.verseSection}` : '';
		return el('section', { className: 'editor-hero g-panel' }, [
			el('p', { className: 'g-kicker', text: 'Conversation' }),
			el('h1', { text: this.config.postId, attrs: { id: 'comment-thread-title' } }),
			el('p', { text: `Heichel ${this.config.heichelId}${coordinate}` })
		]);
	}

	renderMissingContext() {
		this.root.replaceChildren(el('section', { className: 'comment-card state' }, [
			el('p', { className: 'g-kicker', text: 'Context required' }),
			el('h1', { text: 'Comment thread needs a real post', attrs: { id: 'comment-thread-title' } }),
			el('p', { text: `Missing ${this.config.missingRead.join(' and ')}. No comment request was sent.` }),
			el('a', { className: 'soft-btn', text: 'Open Heichelos', attrs: { href: '/heichelos' } })
		]));
	}

	renderLoading() {
		this.root.replaceChildren(el('section', { className: 'comment-card state', attrs: { 'aria-live': 'polite' } }, [
			el('h1', { text: this.config.postId, attrs: { id: 'comment-thread-title' } }),
			el('p', { text: 'Loading the real comment tree…' })
		]));
	}

	renderError(error) {
		this.root.replaceChildren(el('section', { className: 'comment-card state' }, [
			el('h1', { text: 'Comment thread unavailable', attrs: { id: 'comment-thread-title' } }),
			el('p', { text: error.message || 'The comment tree could not be loaded.' }),
			el('button', { className: 'soft-btn', text: 'Try again', attrs: { type: 'button' }, on: { click: () => this.start() } })
		]));
	}
}

function readOnlyNotice() {
	return el('section', { className: 'comment-card state' }, [
		el('h2', { text: 'Read-only conversation' }),
		el('p', { text: 'The thread is real, but no alias was named in this URL. Comment and reply controls are hidden.' }),
		el('a', { className: 'soft-btn', text: 'Choose an alias', attrs: { href: '/profile' } })
	]);
}
