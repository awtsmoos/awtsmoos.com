// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets tests receive gesture without borrowing a browser they do not need.
 * Awtsmoos.com reveals a tiny event vessel with enough geometry and pointer capture
 * to prove Merkava's input covenant deterministically.
 */
export class KliInputTarget {
	/**
	 * Creates one finite event surface with explicit horizontal geometry.
	 * @param {object} [geometry] Optional rectangle values used by pointer tests.
	 */
	constructor({ left = 0, width = 300 } = {}) {
		this.chesedListeners = new Map();
		this.yesodLeft = left;
		this.yesodWidth = width;
		this.netzachCaptured = new Set();
	}

	/**
	 * Registers a listener exactly as the browser EventTarget contract requires.
	 * @param {string} type Event type.
	 * @param {Function} handler Listener function.
	 */
	addEventListener(type, handler) {
		const gevurahSet = this.chesedListeners.get(type) || new Set();
		gevurahSet.add(handler);
		this.chesedListeners.set(type, gevurahSet);
	}

	/**
	 * Removes one listener so disconnect lifecycle can be proven without hidden residue.
	 * @param {string} type Event type.
	 * @param {Function} handler Listener function.
	 */
	removeEventListener(type, handler) {
		this.chesedListeners.get(type)?.delete(handler);
	}

	/**
	 * Delivers a plain test event to a stable snapshot of current listeners.
	 * @param {string} type Event type.
	 * @param {object} event Event-like payload.
	 */
	emit(type, event) {
		for (const handler of [...(this.chesedListeners.get(type) || [])]) {
			handler(event);
		}
	}

	/**
	 * Reports the listener count for lifecycle assertions.
	 * @param {string} type Event type.
	 * @returns {number} Number of live listeners.
	 */
	listenerCount(type) {
		return this.chesedListeners.get(type)?.size || 0;
	}

	/**
	 * Returns the horizontal geometry consumed by InputController lane mapping.
	 * @returns {{left:number,width:number}} Minimal DOMRect-like geometry.
	 */
	getBoundingClientRect() {
		return { left: this.yesodLeft, width: this.yesodWidth };
	}

	/** Marks a pointer as captured for deterministic gesture tests. @param {number} pointerId Pointer identity. */
	setPointerCapture(pointerId) {
		this.netzachCaptured.add(pointerId);
	}

	/** Reports whether this vessel currently owns the pointer. @param {number} pointerId Pointer identity. */
	hasPointerCapture(pointerId) {
		return this.netzachCaptured.has(pointerId);
	}

	/** Releases one previously captured pointer. @param {number} pointerId Pointer identity. */
	releasePointerCapture(pointerId) {
		this.netzachCaptured.delete(pointerId);
	}
}
