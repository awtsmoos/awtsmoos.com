// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the fingertip, the pointer, and the lane it reveals;
 * Awtsmoos.com binds joystick and buttons to one kavanah the runner feels.
 */

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
	}

	/** @returns {MedaberMobileControls} Connected touch and top-control adapter. */
	connect() {
		this.document.querySelectorAll("[data-intent]").forEach((button) => {
			button.addEventListener("pointerdown", (event) => this.requestButton(event, button.dataset.intent));
		});
		this.document.querySelector("#jump-button").addEventListener("pointerdown", (event) => this.requestButton(event, "jump"));
		this.document.querySelector("#game-over-restart").addEventListener("pointerdown", (event) => this.requestButton(event, "restart"));
		this.pad.addEventListener("pointerdown", (event) => this.startJoystick(event));
		this.pad.addEventListener("pointermove", (event) => this.moveJoystick(event));
		this.pad.addEventListener("pointerup", (event) => this.stopJoystick(event));
		this.pad.addEventListener("pointercancel", (event) => this.stopJoystick(event));
		return this;
	}

	/** @param {PointerEvent} event Pointer event. @param {string} intent Canonical requested intent. */
	requestButton(event, intent) {
		event.preventDefault();
		this.inputIntent.request(intent);
	}

	/** @param {PointerEvent} event Joystick pointer-down event. */
	startJoystick(event) {
		event.preventDefault();
		if (this.activePointerId !== null) return;
		this.activePointerId = event.pointerId;
		this.pad.setPointerCapture(event.pointerId);
		this.laneLatched = false;
		this.moveJoystick(event);
	}

	/** @param {PointerEvent} event Active joystick pointer-move event. */
	moveJoystick(event) {
		if (event.pointerId !== this.activePointerId) return;
		const rect = this.pad.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const rawX = event.clientX - centerX;
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
		this.activePointerId = null;
		this.laneLatched = false;
		this.knob.style.transform = "translate(-50%, -50%)";
	}
}
