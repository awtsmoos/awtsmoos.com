// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodWeaponInputGateway.js
 * @description Connects browser keyboard and pointer events to semantic weapon-selection and trigger intentions.
 * Yesod is connection without confusion: the Awtsmoos remains beyond browser event and combat intention alike;
 * Awtsmoos.com lets this gateway keep DOM mechanics outside the weapon domain so input can be replaced, tested, or extended cleanly.
 */
export class YesodWeaponInputGateway {
	/**
	 * Creates an idempotent browser-input gateway with injected callbacks and optional document authority.
	 * @param {object} yesodCallbacks - Semantic input callbacks.
	 * @param {Function} yesodCallbacks.onSelect - Receives zero-based weapon index.
	 * @param {Function} yesodCallbacks.onTriggerChange - Receives true while primary fire is held.
	 * @param {Document|null} [malchusDocument] - Browser document or test double; null disables browser binding.
	 * @sideEffects Stores callback/document references only; listeners are added by `bind`.
	 */
	constructor(yesodCallbacks, malchusDocument = globalThis.document || null) {
		this.yesodCallbacks = yesodCallbacks;
		this.malchusDocument = malchusDocument;
		this.yesodBound = false;
		this.yesodKeyDown = malchusEvent => this.receiveKeyDown(malchusEvent);
		this.yesodMouseDown = malchusEvent => this.receiveMouseDown(malchusEvent);
		this.yesodMouseUp = malchusEvent => this.receiveMouseUp(malchusEvent);
	}

	/**
	 * Binds exactly one listener set; repeated calls are safe and do not duplicate combat input.
	 * @returns {boolean} True when browser listeners exist after the call.
	 * @sideEffects Adds keydown/mousedown/mouseup listeners to the injected document once.
	 */
	bind() {
		if (!this.malchusDocument || this.yesodBound) return this.yesodBound;
		this.malchusDocument.addEventListener("keydown", this.yesodKeyDown);
		this.malchusDocument.addEventListener("mousedown", this.yesodMouseDown);
		this.malchusDocument.addEventListener("mouseup", this.yesodMouseUp);
		this.yesodBound = true;
		return true;
	}

	/**
	 * Translates Digit1–Digit3 into the historical zero-based weapon-selection command.
	 * @param {KeyboardEvent|object} malchusEvent - Browser/test keyboard event.
	 * @returns {void}
	 * @sideEffects May invoke `onSelect`; does not mutate DOM state directly.
	 */
	receiveKeyDown(malchusEvent) {
		if (!["Digit1", "Digit2", "Digit3"].includes(malchusEvent.code)) return;
		this.yesodCallbacks.onSelect(Number(malchusEvent.code.slice(-1)) - 1);
	}

	/**
	 * Begins primary fire only when the pointer is locked to the document body, preserving the existing combat covenant.
	 * @param {MouseEvent|object} malchusEvent - Browser/test pointer event.
	 * @returns {void}
	 * @sideEffects May invoke `onTriggerChange(true)`.
	 */
	receiveMouseDown(malchusEvent) {
		if (malchusEvent.button !== 0 || !this.hasBattlePointerLock()) return;
		this.yesodCallbacks.onTriggerChange(true);
	}

	/**
	 * Ends primary fire on any primary-button release, even after pointer lock has been lost.
	 * @param {MouseEvent|object} malchusEvent - Browser/test pointer event.
	 * @returns {void}
	 * @sideEffects May invoke `onTriggerChange(false)`.
	 */
	receiveMouseUp(malchusEvent) {
		if (malchusEvent.button === 0) this.yesodCallbacks.onTriggerChange(false);
	}

	/**
	 * Reports whether the injected document currently grants battle pointer lock to its body.
	 * @returns {boolean} True only when the body owns pointer lock.
	 * @sideEffects None.
	 */
	hasBattlePointerLock() {
		return Boolean(this.malchusDocument && this.malchusDocument.pointerLockElement === this.malchusDocument.body);
	}
}
