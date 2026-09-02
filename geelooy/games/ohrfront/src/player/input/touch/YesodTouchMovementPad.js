// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodTouchMovementPad.js
 * @description Owns one captured touch pointer and translates its displacement into bounded analog movement state.
 * Yesod binds finger to intention while the Awtsmoos renews center, radius, motion, and release;
 * Awtsmoos.com keeps geometry in this browser vessel and leaves locomotion truth beyond it.
 */
export class YesodTouchMovementPad {
	/** @description Stores state, pad, and visual knob authorities. @param {object} hodState - Touch movement state. @param {object|null} malchusPad - Pad element. @param {object|null} malchusKnob - Knob element. @sideEffects Initializes pointer state only. */
	constructor(hodState, malchusPad, malchusKnob) {
		this.hodState = hodState;
		this.malchusPad = malchusPad;
		this.malchusKnob = malchusKnob;
		this.pointerId = null;
		this.bound = false;
		this.down = event => this.receiveDown(event);
		this.move = event => this.receiveMove(event);
		this.release = event => this.receiveRelease(event);
	}

	/** @description Binds movement-pad pointer events once. @returns {boolean} True when bound. @sideEffects Adds four listeners. */
	bind() {
		if (this.bound || !this.malchusPad) return false;
		this.malchusPad.addEventListener("pointerdown", this.down);
		this.malchusPad.addEventListener("pointermove", this.move);
		this.malchusPad.addEventListener("pointerup", this.release);
		this.malchusPad.addEventListener("pointercancel", this.release);
		this.bound = true;
		return true;
	}

	/** @description Captures one touch pointer and immediately derives its movement. @param {PointerEvent|object} event - Pointer-down event. @returns {void} @sideEffects Captures pointer and updates movement state. */
	receiveDown(event) {
		if (event.pointerType !== "touch" || this.pointerId !== null) return;
		event.preventDefault();
		this.pointerId = event.pointerId;
		this.malchusPad.setPointerCapture?.(event.pointerId);
		this.receiveMove(event);
	}

	/** @description Converts captured pointer displacement into bounded analog axes and knob translation. @param {PointerEvent|object} event - Pointer-move event. @returns {void} @sideEffects Updates movement state and knob transform. */
	receiveMove(event) {
		if (event.pointerId !== this.pointerId) return;
		event.preventDefault();
		const rect = this.malchusPad.getBoundingClientRect();
		const radius = Math.max(1, Math.min(rect.width, rect.height) * 0.42);
		const x = event.clientX - (rect.left + rect.width / 2);
		const y = event.clientY - (rect.top + rect.height / 2);
		const length = Math.hypot(x, y) || 1;
		const scale = Math.min(1, radius / length);
		const boundedX = x * scale;
		const boundedY = y * scale;
		this.hodState.setMovement(-boundedY / radius, boundedX / radius);
		if (this.malchusKnob?.style) {
			this.malchusKnob.style.transform = `translate(${boundedX}px, ${boundedY}px)`;
		}
	}

	/** @description Releases captured movement and recenters both semantic and visual state. @param {PointerEvent|object} event - Ending event. @returns {void} @sideEffects Clears movement and pointer ownership. */
	receiveRelease(event) {
		if (event.pointerId !== this.pointerId) return;
		event.preventDefault();
		this.pointerId = null;
		this.hodState.setMovement(0, 0);
		if (this.malchusKnob?.style) this.malchusKnob.style.transform = "translate(0, 0)";
	}

	/** @description Removes pad listeners and guarantees neutral movement state. @returns {boolean} True when previously bound. @sideEffects Removes listeners and clears movement. */
	dispose() {
		if (!this.bound) return false;
		this.malchusPad.removeEventListener("pointerdown", this.down);
		this.malchusPad.removeEventListener("pointermove", this.move);
		this.malchusPad.removeEventListener("pointerup", this.release);
		this.malchusPad.removeEventListener("pointercancel", this.release);
		this.hodState.setMovement(0, 0);
		this.bound = false;
		return true;
	}
}
