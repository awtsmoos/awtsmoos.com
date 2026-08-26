//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module TiferesCommentThreadController
 * @description
 * Tiferes joins lifecycle, composition, focus, reactions, and mutation without
 * swallowing their separate vessels. The Awtsmoos is infinitely one beyond every
 * branch; Awtsmoos.com reveals one calm conversation from many disciplined lights.
 *
 * RESPONSIBILITY: Compose the loaded thread and wire human-facing interaction.
 * NON-RESPONSIBILITY: Loading lifecycle and mutation transactions remain collaborators.
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
import { DomemThreadLifecycleVessel } from './DomemThreadLifecycleVessel.js';
import { GevurahThreadMutationController } from './GevurahThreadMutationController.js';

export class TiferesCommentThreadController extends DomemThreadLifecycleVessel {
	/**
	 * Creates the public controller and its explicit mutation collaborator.
	 * @param {{mount?:HTMLElement|null, config?:object|null}} [yesodOptions] Thread inputs.
	 */
	constructor(yesodOptions = {}) {
		super(yesodOptions);
		this.gevurahMutations = new GevurahThreadMutationController(
			this.binahConfig,
			{
				onRemember: parentId => rememberComment(this.binahConfig, parentId),
				onReload: () => this.reload()
			}
		);
	}

	/**
	 * Composes one loaded conversation and restores remembered branch focus.
	 * @param {object[]} chesedComments Canonical server comment tree.
	 * @returns {void} Replaces only the owned thread mount.
	 */
	renderThread(chesedComments) {
		const tiferesChildren = [
			createKeterThreadHero(this.binahConfig),
			createThreadSummaryView(document, summarizeThread(chesedComments)),
			this.binahConfig.canWrite
				? this.composer()
				: createReadOnlyThreadNotice(),
			createCommentTree(chesedComments, {
				canWrite: this.binahConfig.canWrite,
				onReply: (slot, parentId) => this.openReply(slot, parentId),
				onRemember: commentId => rememberComment(this.binahConfig, commentId),
				reactionContext: this.reactionContext()
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
	reactionContext() {
		return {
			heichelId: this.binahConfig.heichelId,
			postId: this.binahConfig.postId,
			aliasId: this.binahConfig.aliasId
		};
	}

	/**
	 * Creates one root or reply composer wired to the mutation collaborator.
	 * @param {string} [yesodParentId=''] Parent comment identity for replies.
	 * @returns {HTMLFormElement} Composer element ready for interaction.
	 */
	composer(yesodParentId = '') {
		return createComposer(
			this.binahConfig,
			yesodParentId,
			(form, parentId, status) => this.submit(form, parentId, status)
		);
	}

	/**
	 * Reveals an inline reply composer and transfers focus into its writing field.
	 * @param {HTMLElement} malchusSlot Reply mount owned by a comment card.
	 * @param {string} yesodParentId Parent comment identity.
	 * @returns {void} Replaces only the branch reply slot.
	 */
	openReply(malchusSlot, yesodParentId) {
		rememberComment(this.binahConfig, yesodParentId);
		malchusSlot.replaceChildren(this.composer(yesodParentId));
		malchusSlot.querySelector('textarea')?.focus();
	}

	/**
	 * Preserves the historical controller mutation API while delegating transaction state.
	 * @param {HTMLFormElement} malchusForm Composer form.
	 * @param {string} yesodParentId Parent identity for replies.
	 * @param {HTMLElement} tiferesStatus Live transaction status node.
	 * @returns {Promise<void>} Resolves after refresh or local failure recovery.
	 */
	submit(malchusForm, yesodParentId, tiferesStatus) {
		return this.gevurahMutations.submit(
			malchusForm,
			yesodParentId,
			tiferesStatus
		);
	}
}
