//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MobileControls.js
 * @description Owns Peruta Run joystick capture while delegating explicit buttons to a detachable focused binder.
 * The Awtsmoos renews fingertip, pointer, and lane before the runner feels their call;
 * Awtsmoos.com keeps joystick release exact and button ownership detachable for all.
 */

import { YesodPerutaMobileButtonBindings } from "./MobileButtonBindings.js";

const JOYSTICK_LIMIT = 40;
const LANE_THRESHOLD = 22;
const RESET_THRESHOLD = 12;

export class MedaberMobileControls {
	/** @param {Document} documentRef Game document. @param {object} inputIntent Shared input queue. */
	constructor(documentRef, inputIntent) {
		this.document = documentRef;
		this.inputIntent = inputIntent;
		this.pad = this.document.querySelector("#joystick");
		this.knob = this.document.querySelector("#joystick-knob");
		this.activePointerId = null;
		this.laneLatched = false;
		this.buttons = new YesodPerutaMobileButtonBindings(
			documentRef,
			(intent) => this.inputIntent.request(intent)
		);
		this.boundDown = (event) => this.startJoystick(event);
		this.boundMove = (event) => this.moveJoystick(event);
		this.boundStop = (event) => this.stopJoystick(event);
	}

	/** @returns {MedaberMobileControls} Connected touch adapter. */
	connect() {
		this.buttons.connect();
		this.pad.addEventListener("pointerdown", this.boundDown, { passive: false });
		this.pad.addEventListener("pointermove", this.boundMove, { passive: false });
		this.pad.addEventListener("pointerup", this.boundStop, { passive: false });
		this.pad.addEventListener("pointercancel", this.boundStop, { passive: false });
		return this;
	}

	/** Releases every mobile listener and active capture. */
	disconnect() {
		this.buttons.disconnect();
		this.pad.removeEventListener("pointerdown", this.boundDown);
		this.pad.removeEventListener("pointermove", this.boundMove);
		this.pad.removeEventListener("pointerup", this.boundStop);
		this.pad.removeEventListener("pointercancel", this.boundStop);
		this.releaseJoystick();
	}

	/** @param {PointerEvent} event Joystick pointer-down event. */
	startJoystick(event) {
		event.preventDefault();
		if (this.activePointerId !== null) return;
		this.activePointerId = event.pointerId;
		this.pad.setPointerCapture?.(event.pointerId);
		this.laneLatched = false;
		this.moveJoystick(event);
	}

	/** @param {PointerEvent} event Active joystick pointer-move event. */
	moveJoystick(event) {
		if (event.pointerId !== this.activePointerId) return;
		event.preventDefault();
		const rect = this.pad.getBoundingClientRect();
		const rawX = event.clientX - (rect.left + rect.width / 2);
		const x = Math.max(-JOYSTICK_LIMIT, Math.min(JOYSTICK_LIMIT, rawX));
		this.knob.style.transform = `translate(calc(-50% + ${x}px), -50%)`;
		if (Math.abs(x) < RESET_THRESHOLD) this.laneLatched = false;
		if (this.laneLatched || Math.abs(x) < LANE_THRESHOLD) return;
		this.inputIntent.request(x < 0 ? "left" : "right");
		this.laneLatched = true;
	}

	/** @param {PointerEvent} event Joystick release or cancellation event. */
	stopJoystick(event) {
		if (event.pointerId !== this.activePointerId) return;
		this.releaseJoystick();
	}

	/** Releases capture and restores the visual joystick origin. */
	releaseJoystick() {
		const pointerId = this.activePointerId;
		if (pointerId !== null && this.pad.hasPointerCapture?.(pointerId)) {
			this.pad.releasePointerCapture?.(pointerId);
		}
		this.activePointerId = null;
		this.laneLatched = false;
		this.knob.style.transform = "translate(-50%, -50%)";
	}
}
