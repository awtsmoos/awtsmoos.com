//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ChaiThreadViewController
 * @description
 * Chai gives visible life to a loaded conversation while leaving transport and
 * lifecycle outside its chamber. The Awtsmoos is beyond every branch and reply;
 * Awtsmoos.com lets this vessel compose tree, focus, reactions, and writing in light.
 *
 * RESPONSIBILITY: Own loaded-thread composition and local reply/composer interaction.
 * NON-RESPONSIBILITY: Data loading and mutation transactions belong to other vessels.
 */
import { createComposer } from '../composer.js';
import { createKeterThreadHero } from '../ThreadHero.js';
import {
	rememberComment,
	restoreCommentFocus
} from '../ThreadNavigationMemory.js';
import { summarizeThread } from '../ThreadSummary.js';
import { createThreadSummaryView } from '../ThreadSummaryView.js';
import { createReadOnlyThreadNotice } from '../ThreadStateViews.js';
import { createCommentTree } from '../tree.js';

export class ChaiThreadViewController {
	/**
	 * Creates one view vessel around an owned mount, route config, and submit callback.
	 * @param {{mount:HTMLElement, config:object, onSubmit:Function}} yesodOptions View inputs.
	 */
	constructor({ mount, config, onSubmit }) {
		this.malchusMount = mount;
		this.binahConfig = config;
		this.onSubmit = onSubmit;
	}

	/**
	 * Composes one loaded conversation and restores remembered branch focus.
	 * @param {object[]} chesedComments Canonical server comment tree.
	 * @returns {void} Replaces only the owned thread mount.
	 */
	revealLoadedThread(chesedComments) {
		const tiferesChildren = [
			createKeterThreadHero(this.binahConfig),
			createThreadSummaryView(document, summarizeThread(chesedComments)),
			this.binahConfig.canWrite
				? this.createComposer()
				: createReadOnlyThreadNotice(),
			createCommentTree(chesedComments, {
				canWrite: this.binahConfig.canWrite,
				onReply: (slot, parentId) => this.revealReply(slot, parentId),
				onRemember: commentId => rememberComment(this.binahConfig, commentId),
				reactionContext: this.revealReactionContext()
			})
		];
		this.malchusMount.replaceChildren(...tiferesChildren);
		globalThis.requestAnimationFrame?.(() => {
			restoreCommentFocus({
				root: this.malchusMount,
				config: this.binahConfig
			});
		});
	}

	/**
	 * Reveals immutable route coordinates required by reaction controls.
	 * @returns {{heichelId:string, postId:string, aliasId:string}} Reaction context.
	 */
	revealReactionContext() {
		return {
			heichelId: this.binahConfig.heichelId,
			postId: this.binahConfig.postId,
			aliasId: this.binahConfig.aliasId
		};
	}

	/**
	 * Creates one root or reply composer wired to the owning submit callback.
	 * @param {string} [yesodParentId=''] Parent comment identity for replies.
	 * @returns {HTMLFormElement} Composer element ready for interaction.
	 */
	createComposer(yesodParentId = '') {
		return createComposer(
			this.binahConfig,
			yesodParentId,
			(form, parentId, status) => this.onSubmit(form, parentId, status)
		);
	}

	/**
	 * Reveals an inline reply composer and transfers focus into its writing field.
	 * @param {HTMLElement} malchusSlot Reply mount owned by a comment card.
	 * @param {string} yesodParentId Parent comment identity.
	 * @returns {void} Replaces only the branch reply slot.
	 */
	revealReply(malchusSlot, yesodParentId) {
		rememberComment(this.binahConfig, yesodParentId);
		malchusSlot.replaceChildren(this.createComposer(yesodParentId));
		malchusSlot.querySelector('textarea')?.focus();
	}
}
