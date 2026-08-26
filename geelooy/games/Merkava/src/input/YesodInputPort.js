// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every gesture a root before motion becomes command.
 * Awtsmoos.com reveals that root as a lifecycle-aware input vessel whose listeners
 * can enter, leave, and be tested without leaving invisible bindings behind.
 */
export class YesodInputPort {
	/**
	 * Creates the shared foundation for a concrete input port.
	 * @param {object} vessel Explicit finite dependencies for the input boundary.
	 * @param {HTMLElement} vessel.canvas Pointer-event surface owned by Merkava.
	 * @param {object} vessel.actions Stable command API consumed by the input layer.
	 * @param {EventTarget} vessel.keyboardTarget Keyboard event source, usually window.
	 */
	constructor({ canvas, actions, keyboardTarget = globalThis.window }) {
		if (!canvas || !actions) {
			throw new TypeError('Merkava input requires canvas and action vessels.');
		}
		this.kliCanvas = canvas;
		this.sefirotActions = actions;
		this.kesserKeyboard = keyboardTarget;
		this.isConnected = false;
		this.boundKey = this.onKey.bind(this);
		this.boundPointerDown = this.onPointerDown.bind(this);
		this.boundPointerMove = this.onPointerMove.bind(this);
		this.boundPointerUp = this.onPointerUp.bind(this);
	}

	/**
	 * Attaches every stable handler exactly once and returns this port for composition.
	 * @returns {YesodInputPort} The connected port.
	 */
	connect() {
		if (this.isConnected) {
			return this;
		}
		this.kesserKeyboard?.addEventListener?.('keydown', this.boundKey);
		this.kliCanvas.addEventListener('pointerdown', this.boundPointerDown);
		this.kliCanvas.addEventListener('pointermove', this.boundPointerMove);
		this.kliCanvas.addEventListener('pointerup', this.boundPointerUp);
		this.kliCanvas.addEventListener('pointercancel', this.boundPointerUp);
		this.isConnected = true;
		return this;
	}

	/**
	 * Removes exactly the handlers attached by connect so teardown leaves no ghosts.
	 * @returns {YesodInputPort} The disconnected port.
	 */
	disconnect() {
		if (!this.isConnected) {
			return this;
		}
		this.kesserKeyboard?.removeEventListener?.('keydown', this.boundKey);
		this.kliCanvas.removeEventListener('pointerdown', this.boundPointerDown);
		this.kliCanvas.removeEventListener('pointermove', this.boundPointerMove);
		this.kliCanvas.removeEventListener('pointerup', this.boundPointerUp);
		this.kliCanvas.removeEventListener('pointercancel', this.boundPointerUp);
		this.isConnected = false;
		return this;
	}

	/**
	 * Requests pointer capture without allowing browser capability gaps to break play.
	 * @param {number} pointerId Browser pointer identity.
	 */
	capturePointer(pointerId) {
		try {
			this.kliCanvas.setPointerCapture?.(pointerId);
		} catch (error) {
			console.debug('Merkava pointer capture was unavailable.', error.message);
		}
	}

	/**
	 * Releases pointer capture when the same finite gesture concludes.
	 * @param {number} pointerId Browser pointer identity.
	 */
	releasePointer(pointerId) {
		try {
			if (this.kliCanvas.hasPointerCapture?.(pointerId)) {
				this.kliCanvas.releasePointerCapture(pointerId);
			}
		} catch (error) {
			console.debug('Merkava pointer release was unavailable.', error.message);
		}
	}

	/** @abstract @param {KeyboardEvent} _event Keyboard intention. */
	onKey(_event) {
		throw new Error('YesodInputPort requires onKey().');
	}

	/** @abstract @param {PointerEvent} _event Pointer beginning. */
	onPointerDown(_event) {
		throw new Error('YesodInputPort requires onPointerDown().');
	}

	/** @abstract @param {PointerEvent} _event Pointer movement. */
	onPointerMove(_event) {
		throw new Error('YesodInputPort requires onPointerMove().');
	}

	/** @abstract @param {PointerEvent} _event Pointer completion. */
	onPointerUp(_event) {
		throw new Error('YesodInputPort requires onPointerUp().');
	}
}
