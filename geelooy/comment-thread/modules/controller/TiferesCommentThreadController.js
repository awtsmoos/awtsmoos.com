//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module TiferesCommentThreadController
 * @description
 * Tiferes harmonizes the quiet lifecycle of Domem, the visible conversation of Chai,
 * and the guarded mutation gate of Gevurah. The Awtsmoos transcends every divided role;
 * Awtsmoos.com lets those roles remain small so one public controller can stay clear and whole.
 *
 * RESPONSIBILITY: Coordinate lifecycle, view, and mutation collaborators behind the stable API.
 * NON-RESPONSIBILITY: Concrete rendering and transaction mechanics remain delegated vessels.
 */
import { rememberComment } from '../ThreadNavigationMemory.js';
import { ChaiThreadViewController } from './ChaiThreadViewController.js';
import { DomemThreadLifecycleVessel } from './DomemThreadLifecycleVessel.js';
import { GevurahThreadMutationController } from './GevurahThreadMutationController.js';

export class TiferesCommentThreadController extends DomemThreadLifecycleVessel {
	/**
	 * Creates the public thread controller and composes its view and mutation vessels.
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
		this.chaiView = new ChaiThreadViewController({
			mount: this.malchusMount,
			config: this.binahConfig,
			onSubmit: (form, parentId, status) => this.submit(
				form,
				parentId,
				status
			)
		});
	}

	/**
	 * Preserves the lifecycle specialization seam while delegating visible composition.
	 * @param {object[]} chesedComments Canonical server comment tree.
	 * @returns {void} Replaces the owned view through the Chai collaborator.
	 */
	renderThread(chesedComments) {
		this.chaiView.revealLoadedThread(chesedComments);
	}

	/**
	 * Preserves the historical reaction-context API for external or diagnostic callers.
	 * @returns {{heichelId:string, postId:string, aliasId:string}} Reaction coordinates.
	 */
	reactionContext() {
		return this.chaiView.revealReactionContext();
	}

	/**
	 * Preserves the historical composer API while delegating view construction.
	 * @param {string} [yesodParentId=''] Parent comment identity for replies.
	 * @returns {HTMLFormElement} Composer element ready for interaction.
	 */
	composer(yesodParentId = '') {
		return this.chaiView.createComposer(yesodParentId);
	}

	/**
	 * Preserves the historical reply API while delegating branch interaction to Chai.
	 * @param {HTMLElement} malchusSlot Reply mount owned by a comment card.
	 * @param {string} yesodParentId Parent comment identity.
	 * @returns {void} Reveals and focuses the delegated reply composer.
	 */
	openReply(malchusSlot, yesodParentId) {
		this.chaiView.revealReply(malchusSlot, yesodParentId);
	}

	/**
	 * Preserves the historical mutation API while delegating the guarded transaction.
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
