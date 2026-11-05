//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PointerSwipeControls.js
 * @description Owns one active canvas pointer, browser pointer capture, and discrete swipe interpretation while visible controls remain optional and separately styled.
 * The Awtsmoos renews fingertip and gesture before either becomes one simple lane-bound intent;
 * Awtsmoos.com lets Yesod hold one touch-path at a time, then releases capture cleanly so mobile freedom never becomes hidden input debt.
 */

import { SwipeInterpreter } from "./SwipeInterpreter.js";

export class YesodPointerSwipeControls {
	/**
	 * @description Captures the native canvas plus canonical intent/feedback callbacks and binds stable pointer listener identities for symmetric connection lifecycle.
	 * @param {HTMLCanvasElement} canvas Native game canvas receiving swipe gestures.
	 * @param {Function} send Canonical intention sender invoked after a valid swipe resolves.
	 * @param {Function} awaken Feedback awakener invoked on initial pointer contact.
	 * @returns {void}
	 */
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

	/**
	 * @description Attaches non-passive pointer listeners to the canvas so gesture handling may prevent browser scrolling/selection while gameplay owns the surface.
	 * @returns {void}
	 */
	connect() {
		this.canvas.addEventListener("pointerdown", this.boundDown, { passive: false });
		this.canvas.addEventListener("pointerup", this.boundUp, { passive: false });
		this.canvas.addEventListener("pointercancel", this.boundCancel, { passive: false });
	}

	/**
	 * @description Removes every canvas pointer listener and releases any still-captured pointer so disposal never leaves browser input ownership behind.
	 * @returns {void}
	 */
	disconnect() {
		this.canvas.removeEventListener("pointerdown", this.boundDown);
		this.canvas.removeEventListener("pointerup", this.boundUp);
		this.canvas.removeEventListener("pointercancel", this.boundCancel);
		this.releaseActivePointer();
	}

	/**
	 * @description Begins exactly one gesture, awakens feedback, records origin/time, and requests browser pointer capture so release remains associated with this canvas.
	 * @param {PointerEvent} event Pointer-down event establishing swipe origin.
	 * @returns {void}
	 */
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

	/**
	 * @description Completes the active matching gesture, releases capture before interpretation, and forwards only a validated canonical swipe intent.
	 * @param {PointerEvent} event Pointer-up event establishing swipe destination.
	 * @returns {void}
	 */
	onUp(event) {
		event.preventDefault();
		if (!this.pointer || event.pointerId !== this.pointer.id) return;
		const origin = this.pointer;
		this.releaseActivePointer();
		const intent = this.swipes.interpret(origin, event);
		if (intent) this.send(intent);
	}

	/**
	 * @description Cancels only the currently owned pointer id and releases capture without synthesizing any movement intention.
	 * @param {PointerEvent} event Browser pointer-cancel event.
	 * @returns {void}
	 */
	onCancel(event) {
		if (this.pointer?.id !== event.pointerId) return;
		this.releaseActivePointer();
	}

	/**
	 * @description Releases browser capture for the active pointer when still held, then clears local gesture state in one deterministic order.
	 * @returns {void}
	 */
	releaseActivePointer() {
		const pointerId = this.pointer?.id;
		if (pointerId !== undefined && this.canvas.hasPointerCapture?.(pointerId)) {
			this.canvas.releasePointerCapture?.(pointerId);
		}
		this.pointer = null;
	}
}
