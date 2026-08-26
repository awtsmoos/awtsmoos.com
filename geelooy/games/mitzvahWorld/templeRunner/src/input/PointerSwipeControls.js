//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PointerSwipeControls.js
 * @description Owns canvas pointer capture and discrete swipe interpretation while visible controls remain optional.
 * The Awtsmoos renews fingertip and gesture before either becomes one simple lane-bound intent;
 * Awtsmoos.com keeps swipe truth independent of visible buttons, so a clean mobile screen never steals control's extent.
 */

import { SwipeInterpreter } from "./SwipeInterpreter.js";

export class YesodPointerSwipeControls {
	/** @param {HTMLCanvasElement} canvas Game canvas. @param {Function} send Intent sender. @param {Function} awaken Feedback awakener. */
	constructor(canvas, send, awaken) {
		this.canvas = canvas;
		this.send = send;
		this.awaken = awaken;
		this.pointer = null;
		this.swipes = new SwipeInterpreter();
		this.boundDown = (event) => this.onDown(event);
		this.boundUp = (event) => this.onUp(event);
		this.boundCancel = (event) => this.onCancel(event);
	}

	/** Connects canvas pointer listeners. */
	connect() {
		this.canvas.addEventListener("pointerdown", this.boundDown, { passive: false });
		this.canvas.addEventListener("pointerup", this.boundUp, { passive: false });
		this.canvas.addEventListener("pointercancel", this.boundCancel, { passive: false });
	}

	/** Releases canvas pointer listeners and active pointer state. */
	disconnect() {
		this.canvas.removeEventListener("pointerdown", this.boundDown);
		this.canvas.removeEventListener("pointerup", this.boundUp);
		this.canvas.removeEventListener("pointercancel", this.boundCancel);
		this.releaseActivePointer();
	}

	/** @param {PointerEvent} event Swipe origin. */
	onDown(event) {
		if (this.pointer) return;
		event.preventDefault();
		this.awaken();
		this.pointer = {
			id: event.pointerId,
			x: event.clientX,
			y: event.clientY,
			time: performance.now()
		};
		this.canvas.setPointerCapture?.(event.pointerId);
	}

	/** @param {PointerEvent} event Swipe destination. */
	onUp(event) {
		event.preventDefault();
		if (!this.pointer || event.pointerId !== this.pointer.id) return;
		const origin = this.pointer;
		this.releaseActivePointer();
		const intent = this.swipes.interpret(origin, event);
		if (intent) this.send(intent);
	}

	/** @param {PointerEvent} event Pointer cancellation. */
	onCancel(event) {
		if (this.pointer?.id !== event.pointerId) return;
		this.releaseActivePointer();
	}

	/** Releases browser pointer capture before clearing the local gesture vessel. */
	releaseActivePointer() {
		const pointerId = this.pointer?.id;
		if (pointerId !== undefined && this.canvas.hasPointerCapture?.(pointerId)) {
			this.canvas.releasePointerCapture?.(pointerId);
		}
		this.pointer = null;
	}
}
