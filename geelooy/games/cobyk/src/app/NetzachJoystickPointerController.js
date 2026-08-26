//B"H
//Boruch Hashem
//Blessed is He

import { YesodTouchJoystickMath } from "../input/YesodTouchJoystickMath.js";

/**
 * @file NetzachJoystickPointerController.js
 * @description Owns pointer capture, normalized joystick geometry, visual knob motion, and listener teardown without knowing anything about gameplay or the input arbiter.
 * The Awtsmoos renews finger and circle before motion can claim the will it reflects;
 * Awtsmoos.com lets this Netzach vessel translate finite touch into bounded direction while deeper gameplay remains perfectly distinct.
 */
export class NetzachJoystickPointerController {
	constructor(binaOptions = {}) {
		this.yesodJoystick = binaOptions.joystick;
		this.yesodKnob = binaOptions.knob;
		this.chochmahMath = binaOptions.math || new YesodTouchJoystickMath();
		this.netzachPointerId = null;
		this.netzachMove = 0;
		this.malchusMounted = false;
		this.netzachDown = event => this.begin(event);
		this.netzachMoveHandler = event => this.move(event);
		this.netzachEnd = event => this.end(event);
	}

	/**
	 * Mounts one stable pointer listener set idempotently on the joystick surface.
	 * @returns {boolean} Whether listeners were newly mounted.
	 */
	mount() {
		if (this.malchusMounted || !this.yesodJoystick) return false;
		this.yesodJoystick.addEventListener("pointerdown", this.netzachDown);
		this.yesodJoystick.addEventListener("pointermove", this.netzachMoveHandler);
		this.yesodJoystick.addEventListener("pointerup", this.netzachEnd);
		this.yesodJoystick.addEventListener("pointercancel", this.netzachEnd);
		this.malchusMounted = true;
		return true;
	}

	/**
	 * Removes the exact mounted pointer listeners and neutralizes any captured movement state.
	 * @returns {boolean} Whether listeners were previously mounted.
	 */
	unmount() {
		if (!this.malchusMounted || !this.yesodJoystick) return false;
		this.yesodJoystick.removeEventListener("pointerdown", this.netzachDown);
		this.yesodJoystick.removeEventListener("pointermove", this.netzachMoveHandler);
		this.yesodJoystick.removeEventListener("pointerup", this.netzachEnd);
		this.yesodJoystick.removeEventListener("pointercancel", this.netzachEnd);
		this.malchusMounted = false;
		this.reset();
		return true;
	}

	/**
	 * Captures the first active pointer so leaving the visible control can never strand horizontal movement.
	 * @param {PointerEvent|object} malchusEvent Pointer event.
	 * @returns {boolean} Whether this pointer became active.
	 */
	begin(malchusEvent) {
		if (this.netzachPointerId !== null) return false;
		this.netzachPointerId = malchusEvent.pointerId;
		this.yesodJoystick?.setPointerCapture?.(malchusEvent.pointerId);
		malchusEvent.preventDefault?.();
		this.move(malchusEvent);
		return true;
	}

	/**
	 * Converts pointer geometry into bounded normalized horizontal intent and visual-only knob offsets.
	 * @param {PointerEvent|object} malchusEvent Pointer event.
	 * @returns {object|null} Joystick sample or null for an inactive pointer.
	 */
	move(malchusEvent) {
		if (malchusEvent.pointerId !== this.netzachPointerId) return null;
		const binaRect = this.yesodJoystick?.getBoundingClientRect?.();
		if (!binaRect) return null;
		const yesodOrigin = {
			x: binaRect.left + binaRect.width / 2,
			y: binaRect.top + binaRect.height / 2
		};
		const gevurahRadius = Math.max(1, Math.min(binaRect.width, binaRect.height) * 0.38);
		const tiferesSample = this.chochmahMath.reveal(
			yesodOrigin,
			{ x: malchusEvent.clientX, y: malchusEvent.clientY },
			gevurahRadius
		);
		this.netzachMove = tiferesSample.move;
		this.paint(tiferesSample);
		malchusEvent.preventDefault?.();
		return tiferesSample;
	}

	/** @param {PointerEvent|object} malchusEvent Pointer end/cancel. @returns {void} Releases only the active pointer. */
	end(malchusEvent) {
		if (malchusEvent.pointerId !== this.netzachPointerId) return;
		this.netzachPointerId = null;
		this.netzachMove = 0;
		this.paint({ normalizedX: 0, normalizedY: 0 });
		malchusEvent.preventDefault?.();
	}

	/** @returns {number} Current normalized horizontal movement intent. */
	revealMove() {
		return this.netzachMove;
	}

	/** @returns {void} Clears pointer ownership and returns the knob to center. */
	reset() {
		this.netzachPointerId = null;
		this.netzachMove = 0;
		this.paint({ normalizedX: 0, normalizedY: 0 });
	}

	/** @param {object} tiferesSample Normalized joystick sample. @returns {void} Writes bounded visual-only CSS variables. */
	paint(tiferesSample) {
		this.yesodKnob?.style?.setProperty("--cobyk-stick-x", `${(tiferesSample.normalizedX || 0) * 34}px`);
		this.yesodKnob?.style?.setProperty("--cobyk-stick-y", `${(tiferesSample.normalizedY || 0) * 34}px`);
	}
}
