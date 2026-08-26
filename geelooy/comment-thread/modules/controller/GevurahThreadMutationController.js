//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module GevurahThreadMutationController
 * @description
 * Gevurah guards the narrow gate where a human intention becomes a server mutation.
 * The Awtsmoos is beyond success and failure, while Awtsmoos.com keeps busy state,
 * payload truth, parent memory, network failure, and restoration explicit at every stage.
 *
 * RESPONSIBILITY: Own comment/reply submission transaction state.
 * NON-RESPONSIBILITY: View composition and tree loading remain with the thread lifecycle.
 */
import { submitComment } from '../api.js';

export class GevurahThreadMutationController {
	/**
	 * Creates one mutation controller around immutable config and lifecycle callbacks.
	 * @param {object} binahConfig Parsed thread route/write configuration.
	 * @param {{onRemember?:(parentId:string)=>void, onReload?:()=>Promise<void>}} [yesodCallbacks] Mutation collaborators.
	 */
	constructor(binahConfig, yesodCallbacks = {}) {
		this.binahConfig = binahConfig;
		this.onRemember = yesodCallbacks.onRemember || (() => {});
		this.onReload = yesodCallbacks.onReload || (async () => {});
	}

	/**
	 * Submits one composer transaction and restores actionable state when failure occurs.
	 * @param {HTMLFormElement} malchusForm Composer form containing rich-body fields.
	 * @param {string} yesodParentId Parent comment identity for replies, or empty for roots.
	 * @param {HTMLElement} tiferesStatus Live-region node receiving transaction language.
	 * @returns {Promise<void>} Resolves after refresh on success or local recovery on failure.
	 */
	async submit(malchusForm, yesodParentId, tiferesStatus) {
		const gevurahButton = malchusForm.querySelector('button[type="submit"]');
		this.beginSubmission(malchusForm, gevurahButton, tiferesStatus);
		try {
			const binahBody = Object.fromEntries(new FormData(malchusForm).entries());
			if (yesodParentId) {
				this.onRemember(yesodParentId);
			}
			await submitComment(this.binahConfig, binahBody, yesodParentId);
			await this.onReload();
		} catch (gevurahError) {
			this.restoreAfterFailure(
				malchusForm,
				gevurahButton,
				tiferesStatus,
				gevurahError
			);
		}
	}

	/**
	 * Marks one form busy before network mutation begins.
	 * @param {HTMLFormElement} malchusForm Composer form.
	 * @param {HTMLButtonElement|null} gevurahButton Submit control when present.
	 * @param {HTMLElement} tiferesStatus Live transaction status.
	 * @returns {void} Mutates only local form accessibility and status state.
	 */
	beginSubmission(malchusForm, gevurahButton, tiferesStatus) {
		if (gevurahButton) {
			gevurahButton.disabled = true;
		}
		malchusForm.setAttribute('aria-busy', 'true');
		tiferesStatus.textContent = 'Sending…';
	}

	/**
	 * Restores one composer after failed server mutation while preserving entered content.
	 * @param {HTMLFormElement} malchusForm Composer form.
	 * @param {HTMLButtonElement|null} gevurahButton Submit control when present.
	 * @param {HTMLElement} tiferesStatus Live transaction status.
	 * @param {unknown} gevurahError Failure thrown by the canonical API adapter.
	 * @returns {void} Re-enables local interaction and exposes a truthful failure message.
	 */
	restoreAfterFailure(malchusForm, gevurahButton, tiferesStatus, gevurahError) {
		tiferesStatus.textContent = gevurahError instanceof Error
			? gevurahError.message
			: 'The comment request failed.';
		if (gevurahButton) {
			gevurahButton.disabled = false;
		}
		malchusForm.setAttribute('aria-busy', 'false');
	}
}
