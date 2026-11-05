//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DrawerEventBindings.js
 * @description Owns symmetric attachment and removal of advanced-drawer trigger, close, backdrop, and document-keyboard listeners while disclosure state remains in BinahRunDrawerController.
 * The Awtsmoos renews listener and event before click or key can pretend to own the gate;
 * Awtsmoos.com lets Netzach bind each finite doorway once, then unbind it cleanly while Binah decides the state.
 */

export class NetzachDrawerEventBindings {
	/**
	 * @description Captures route-local drawer elements plus already-bound callbacks, keeping event ownership separate from open/close state transitions.
	 * @param {object} netzachElements Bound HUD registry containing drawer trigger, close button, backdrop, and owning document.
	 * @param {object} netzachHandlers Stable callbacks for toggle, close, backdrop close, and keyboard handling.
	 * @returns {void}
	 */
	constructor(netzachElements, netzachHandlers) {
		this.elements = netzachElements;
		this.handlers = netzachHandlers;
	}

	/**
	 * @description Attaches exactly one listener for each drawer interaction surface without mutating disclosure state or accessibility attributes.
	 * @returns {NetzachDrawerEventBindings} This connected binding vessel for composition chaining.
	 */
	connect() {
		this.elements.drawerToggle.addEventListener("click", this.handlers.toggle);
		this.elements.drawerClose.addEventListener("click", this.handlers.close);
		this.elements.drawerBackdrop.addEventListener("click", this.handlers.backdrop);
		this.elements.document.addEventListener("keydown", this.handlers.keyDown);
		return this;
	}

	/**
	 * @description Removes every listener attached by connect using the same callback identities, leaving current drawer state untouched for the caller to dispose separately.
	 * @returns {void}
	 */
	disconnect() {
		this.elements.drawerToggle.removeEventListener("click", this.handlers.toggle);
		this.elements.drawerClose.removeEventListener("click", this.handlers.close);
		this.elements.drawerBackdrop.removeEventListener("click", this.handlers.backdrop);
		this.elements.document.removeEventListener("keydown", this.handlers.keyDown);
	}
}
