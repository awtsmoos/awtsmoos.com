// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodPointerLockGateway.js
 * @description Isolates browser pointer-lock APIs and events from launch/presentation policy while preserving immediate user-activation requests.
 * Yesod connects browser capability to combat intention while the Awtsmoos remains beyond lock, pointer, document, and player;
 * Awtsmoos.com lets this gateway make a difficult browser boundary injectable, testable, and explicit instead of hiding it inside overlay code.
 */
export class YesodPointerLockGateway {
	/**
	 * Creates the gateway around an injected document authority.
	 * @param {Document|null} [malchusDocument] - Browser document or test double.
	 * @sideEffects Stores the document reference only.
	 */
	constructor(malchusDocument = globalThis.document || null) {
		this.malchusDocument = malchusDocument;
	}

	/**
	 * Requests pointer lock on the document body inside the caller's current user-activation stack.
	 * @returns {Promise<void>|undefined} Browser request result when Promise-like, otherwise undefined.
	 * @throws Re-throws synchronous browser capability errors so presentation policy can decide recovery.
	 * @sideEffects Invokes the browser pointer-lock API.
	 */
	request() {
		return this.malchusDocument?.body?.requestPointerLock?.();
	}

	/** Reports whether the document body currently owns pointer lock. */
	isLocked() {
		return Boolean(
			this.malchusDocument
			&& this.malchusDocument.pointerLockElement === this.malchusDocument.body
		);
	}

	/**
	 * Binds pointer-lock change/error events to injected semantic callbacks.
	 * @param {object} yesodCallbacks - Event callbacks.
	 * @param {Function} yesodCallbacks.onChange - Called after browser lock ownership changes.
	 * @param {Function} yesodCallbacks.onError - Called after browser pointer-lock failure.
	 * @returns {void}
	 * @sideEffects Installs browser document event listeners.
	 */
	bind(yesodCallbacks) {
		if (!this.malchusDocument) return;
		this.malchusDocument.addEventListener("pointerlockchange", yesodCallbacks.onChange);
		this.malchusDocument.addEventListener("pointerlockerror", yesodCallbacks.onError);
	}
}
