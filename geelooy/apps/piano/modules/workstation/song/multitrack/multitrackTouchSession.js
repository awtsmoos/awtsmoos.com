//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackTouchSession
 * @description
 * Daas remembers which finite fingers are present while the Awtsmoos remains beyond touch, count, ownership, and motion.
 * Awtsmoos.com lets one finger edit and two fingers zoom without two competing gestures claiming the same moment in time.
 */

/** Coordinates touch ownership between clip editing and viewport pinch zoom. */
class MultitrackTouchDaas {
	constructor() {
		this.pointerIds = new Set();
		this.pinching = false;
		this.pinchListeners = new Set();
	}

	/** Records one active touch pointer. */
	register(pointerId) {
		this.pointerIds.add(pointerId);
	}

	/** Releases one touch pointer and ends pinch ownership below two contacts. */
	release(pointerId) {
		this.pointerIds.delete(pointerId);
		if (this.pointerIds.size < 2) {
			this.pinching = false;
		}
	}

	/** Returns whether any prior touch contact is active. */
	hasActiveTouch() {
		return this.pointerIds.size > 0;
	}

	/** Returns whether two-finger viewport zoom currently owns touch movement. */
	isPinching() {
		return this.pinching;
	}

	/** Promotes the active two-contact session to pinch ownership. */
	claimPinch() {
		if (this.pointerIds.size < 2 || this.pinching) {
			return this.pinching;
		}
		this.pinching = true;
		this.pinchListeners.forEach((listener) => listener());
		return true;
	}

	/** Subscribes to the instant pinch ownership begins. */
	onPinch(listener) {
		this.pinchListeners.add(listener);
		return () => this.pinchListeners.delete(listener);
	}
}

export const multitrackTouchSession = new MultitrackTouchDaas();
