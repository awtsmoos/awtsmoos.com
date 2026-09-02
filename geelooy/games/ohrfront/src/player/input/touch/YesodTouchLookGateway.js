// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodTouchLookGateway.js
 * @description Converts one captured battlefield touch drag into ordinary first-person look deltas without pointer lock.
 * The Awtsmoos renews gaze and gesture before any browser capture can become their source;
 * Awtsmoos.com lets mobile sight flow through the same player callback while overlays retain their own touch territory.
 */
export class YesodTouchLookGateway {
	/**
	 * @description Stores the semantic look callback and battlefield canvas without binding yet.
	 * @param {Function} onLook - Existing first-person look callback.
	 * @param {HTMLElement|object|null} malchusCanvas - Native battlefield canvas.
	 * @sideEffects Stores pointer-tracking state only.
	 */
	constructor(onLook, malchusCanvas) {
		this.onLook = onLook;
		this.malchusCanvas = malchusCanvas;
		this.pointerId = null;
		this.last = null;
		this.down = event => this.receiveDown(event);
		this.move = event => this.receiveMove(event);
		this.release = event => this.receiveRelease(event);
	}

	/** @description Binds touch-look pointer events. @returns {boolean} True when a canvas exists. @sideEffects Adds four listeners. */
	bind() {
		if (!this.malchusCanvas) return false;
		this.malchusCanvas.addEventListener("pointerdown", this.down);
		this.malchusCanvas.addEventListener("pointermove", this.move);
		this.malchusCanvas.addEventListener("pointerup", this.release);
		this.malchusCanvas.addEventListener("pointercancel", this.release);
		return true;
	}

	/** @description Captures the first eligible touch as look authority. @param {PointerEvent|object} event - Pointer event. @returns {void} @sideEffects Captures pointer and stores coordinates. */
	receiveDown(event) {
		if (event.pointerType !== "touch" || this.pointerId !== null) return;
		event.preventDefault();
		this.pointerId = event.pointerId;
		this.last = { x: event.clientX, y: event.clientY };
		this.malchusCanvas.setPointerCapture?.(event.pointerId);
	}

	/** @description Converts captured touch displacement into semantic look deltas. @param {PointerEvent|object} event - Pointer move. @returns {void} @sideEffects Calls `onLook` and advances stored coordinates. */
	receiveMove(event) {
		if (event.pointerId !== this.pointerId || !this.last) return;
		event.preventDefault();
		const deltaX = event.clientX - this.last.x;
		const deltaY = event.clientY - this.last.y;
		this.last = { x: event.clientX, y: event.clientY };
		this.onLook(deltaX, deltaY);
	}

	/** @description Releases touch-look ownership on up or cancellation. @param {PointerEvent|object} event - Ending pointer event. @returns {void} @sideEffects Clears captured state. */
	receiveRelease(event) {
		if (event.pointerId !== this.pointerId) return;
		event.preventDefault();
		this.pointerId = null;
		this.last = null;
	}

	/** @description Removes every touch-look listener. @returns {boolean} True when a canvas existed. @sideEffects Removes four listeners. */
	dispose() {
		if (!this.malchusCanvas) return false;
		this.malchusCanvas.removeEventListener("pointerdown", this.down);
		this.malchusCanvas.removeEventListener("pointermove", this.move);
		this.malchusCanvas.removeEventListener("pointerup", this.release);
		this.malchusCanvas.removeEventListener("pointercancel", this.release);
		return true;
	}
}
