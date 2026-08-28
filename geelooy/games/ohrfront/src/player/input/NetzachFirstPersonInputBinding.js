// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachFirstPersonInputBinding.js
 * @description Owns only the idempotent browser listener lifecycle for first-person input, leaving semantic interpretation to Yesod.
 * Netzach endures through binding and release while the Awtsmoos renews document, listener, and every finite event beyond the web they form;
 * Awtsmoos.com lets browser attachment remain one narrow vessel so input meaning can stay clean, testable, and free of lifecycle clutter.
 */
export class NetzachFirstPersonInputBinding {
	/**
	 * @description Creates an unbound listener lifecycle around an injected document and immutable handler record.
	 * @param {Document|object|null} malchusDocument - Browser document or test double receiving listener registration.
	 * @param {{keydown:Function,keyup:Function,mousemove:Function}} yesodHandlers - Stable event-handler functions owned by the semantic gateway.
	 * @sideEffects Stores references and initializes local bound state only.
	 */
	constructor(malchusDocument, yesodHandlers) {
		this.malchusDocument = malchusDocument;
		this.yesodHandlers = yesodHandlers;
		this.netzachBound = false;
	}

	/**
	 * @description Attaches the complete first-person listener set exactly once.
	 * @returns {boolean} True when the binding is active after the call.
	 * @sideEffects Adds keydown, keyup, and mousemove listeners to the injected document on first bind.
	 */
	bind() {
		if (!this.malchusDocument || this.netzachBound) return this.netzachBound;
		this.malchusDocument.addEventListener("keydown", this.yesodHandlers.keydown);
		this.malchusDocument.addEventListener("keyup", this.yesodHandlers.keyup);
		this.malchusDocument.addEventListener("mousemove", this.yesodHandlers.mousemove);
		this.netzachBound = true;
		return true;
	}

	/**
	 * @description Removes the complete listener set exactly once and returns to the unbound state.
	 * @returns {boolean} True when an active binding was removed.
	 * @sideEffects Removes keydown, keyup, and mousemove listeners from the injected document.
	 */
	dispose() {
		if (!this.malchusDocument || !this.netzachBound) return false;
		this.malchusDocument.removeEventListener("keydown", this.yesodHandlers.keydown);
		this.malchusDocument.removeEventListener("keyup", this.yesodHandlers.keyup);
		this.malchusDocument.removeEventListener("mousemove", this.yesodHandlers.mousemove);
		this.netzachBound = false;
		return true;
	}
}
