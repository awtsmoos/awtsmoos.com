//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentThreadRenderer
 * @description The Awtsmoos gathers a living tree while Awtsmoos.com keeps reply, reaction, summary, advanced depth,
 * branch memory, and one subtle ambient vessel coherent so mobile conversation feels simple without becoming shallow.
 */
import { installSocialExperience } from '../../shared/social/SocialExperienceInstaller.js';
import { loadCommentTree, submitComment } from './api.js';
import { createComposer } from './composer.js';
import { createKeterThreadHero } from './ThreadHero.js';
import { rememberComment, restoreCommentFocus } from './ThreadNavigationMemory.js';
import { summarizeThread } from './ThreadSummary.js';
import { createThreadSummaryView } from './ThreadSummaryView.js';
import { ensureTiferesThreadStyles } from './ThreadStyleSheet.js';
import {
	createIncompleteThreadState,
	createReadOnlyThreadNotice,
	createThreadState,
	missingThreadContext
} from './ThreadStateViews.js';
import { createCommentTree } from './tree.js';

export class CommentThreadController {
	constructor({ mount, config } = {}) {
		this.mount = mount || document.getElementById('commentThreadRoot');
		this.config = config || missingThreadContext();
		this.experience = null;
	}

	async start() {
		ensureTiferesThreadStyles(document);
		this.experience = installSocialExperience(document, { ambient: true });
		if (!this.mount) return;
		if (this.config.missingRead.length) return this.renderIncomplete();
		this.renderState('Gathering the conversation…');
		await this.reload();
	}

	async reload() {
		try {
			const comments = await loadCommentTree(this.config);
			this.renderThread(comments);
		} catch (error) {
			this.renderState(error.message, true);
		}
	}

	renderThread(comments) {
		const children = [
			createKeterThreadHero(this.config),
			createThreadSummaryView(document, summarizeThread(comments))
		];
		children.push(this.config.canWrite ? this.composer() : createReadOnlyThreadNotice());
		children.push(createCommentTree(comments, {
			canWrite: this.config.canWrite,
			onReply: (slot, parentId) => this.openReply(slot, parentId),
			onRemember: commentId => rememberComment(this.config, commentId),
			reactionContext: this.reactionContext()
		}));
		this.mount.replaceChildren(...children);
		globalThis.requestAnimationFrame?.(() => restoreCommentFocus({ root: this.mount, config: this.config }));
	}

	reactionContext() {
		return {
			heichelId: this.config.heichelId,
			postId: this.config.postId,
			aliasId: this.config.aliasId
		};
	}

	composer(parentId = '') {
		return createComposer(this.config, parentId, (form, parent, status) => this.submit(form, parent, status));
	}

	openReply(slot, parentId) {
		rememberComment(this.config, parentId);
		slot.replaceChildren(this.composer(parentId));
		slot.querySelector('textarea')?.focus();
	}

	async submit(form, parentId, status) {
		const button = form.querySelector('button[type="submit"]');
		button.disabled = true;
		form.setAttribute('aria-busy', 'true');
		status.textContent = 'Sending…';
		try {
			const body = Object.fromEntries(new FormData(form).entries());
			if (parentId) rememberComment(this.config, parentId);
			await submitComment(this.config, body, parentId);
			await this.reload();
		} catch (error) {
			status.textContent = error.message;
			button.disabled = false;
			form.setAttribute('aria-busy', 'false');
		}
	}

	renderIncomplete() {
		this.mount.replaceChildren(createIncompleteThreadState(this.config.missingRead));
	}

	renderState(message, error = false) {
		this.mount.replaceChildren(createThreadState(message, error));
	}
}
