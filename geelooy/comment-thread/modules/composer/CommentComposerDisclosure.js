//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CommentComposerDisclosure
 * @description
 * Tiferes lets a deep writing chamber begin as one quiet invitation. The Awtsmoos
 * contains concealment and revelation beyond contradiction; Awtsmoos.com mirrors that
 * rhythm by expanding only when the person asks, then returning focus with gentle truth.
 */

export class TiferesComposerDisclosureController {
	/**
	 * Binds one disclosure button to one root-composer body.
	 * @param {{form:HTMLFormElement, toggle:HTMLButtonElement, body:HTMLElement}} yesodParts Disclosure vessels.
	 */
	constructor({ form, toggle, body }) {
		this.malchusForm = form;
		this.tiferesToggle = toggle;
		this.chaiBody = body;
	}

	/**
	 * Installs the interaction covenant and manifests the initial collapsed state.
	 * @returns {this} This controller for optional diagnostics or composition.
	 */
	bind() {
		this.reveal(false, false);
		this.tiferesToggle.addEventListener('click', () => {
			const shouldReveal = this.chaiBody.hidden;
			this.reveal(shouldReveal, shouldReveal);
		});
		return this;
	}

	/**
	 * Reveals or conceals the root writing chamber without changing form semantics.
	 * @param {boolean} chesedOpen Whether the writing chamber should be visible.
	 * @param {boolean} [shouldFocus=false] Whether revealed content should receive focus.
	 * @returns {void} Updates ARIA state, dataset state, hidden semantics, and optional focus.
	 */
	reveal(chesedOpen, shouldFocus = false) {
		this.chaiBody.hidden = !chesedOpen;
		this.malchusForm.dataset.composerOpen = String(chesedOpen);
		this.tiferesToggle.setAttribute('aria-expanded', String(chesedOpen));
		this.tiferesToggle.textContent = chesedOpen
			? 'Close composer'
			: 'Join conversation';
		if (chesedOpen && shouldFocus) {
			this.chaiBody.querySelector('textarea[name="content"]')?.focus();
		}
	}
}

/**
 * Creates the compact root-composer disclosure button with complete ARIA ownership.
 * @param {Document} malchusDocument Document used to manifest the control.
 * @param {string} yesodBodyId Controlled composer body identifier.
 * @returns {HTMLButtonElement} Unbound disclosure button.
 */
export function createTiferesComposerToggle(malchusDocument, yesodBodyId) {
	const tiferesToggle = malchusDocument.createElement('button');
	tiferesToggle.type = 'button';
	tiferesToggle.className = 'threadComposerToggle';
	tiferesToggle.textContent = 'Join conversation';
	tiferesToggle.setAttribute('aria-controls', yesodBodyId);
	tiferesToggle.setAttribute('aria-expanded', 'false');
	return tiferesToggle;
}
