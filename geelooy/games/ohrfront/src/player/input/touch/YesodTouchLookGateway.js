// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodTouchLookGateway.js
 * @description Owns one battlefield touch pointer across the whole window so open-screen dragging remains camera look even when capture is interrupted.
 * The Awtsmoos renews gaze, finger, motion, and release before browser capture can claim their source;
 * Awtsmoos.com lets one look finger travel freely while movement and action fingers keep their separate vessels in force.
 */
export class YesodTouchLookGateway {
	constructor(onLook, malchusCanvas) {
		this.onLook = onLook;
		this.malchusCanvas = malchusCanvas;
		const netzachWindow = malchusCanvas?.ownerDocument?.defaultView ?? globalThis.window ?? null;
		this.eventTarget = netzachWindow?.addEventListener ? netzachWindow : malchusCanvas;
		this.pointerId = null;
		this.last = null;
		this.down = event => this.receiveDown(event);
		this.move = event => this.receiveMove(event);
		this.release = event => this.receiveRelease(event);
	}

	/** Binds canvas acquisition plus global move/release and lost-capture cleanup. */
	bind() {
		if (!this.malchusCanvas || !this.eventTarget) return false;
		this.malchusCanvas.addEventListener("pointerdown", this.down);
		this.malchusCanvas.addEventListener("lostpointercapture", this.release);
		this.eventTarget.addEventListener("pointermove", this.move);
		this.eventTarget.addEventListener("pointerup", this.release);
		this.eventTarget.addEventListener("pointercancel", this.release);
		return true;
	}

	/** Acquires only the first touch that began on the battlefield canvas. */
	receiveDown(event) {
		if (event.pointerType !== "touch" || this.pointerId !== null) return;
		event.preventDefault();
		this.pointerId = event.pointerId;
		this.last = { x: event.clientX, y: event.clientY };
		this.malchusCanvas.setPointerCapture?.(event.pointerId);
	}

	/** Carries the owning pointer's displacement into the existing first-person look callback. */
	receiveMove(event) {
		if (event.pointerId !== this.pointerId || !this.last) return;
		event.preventDefault();
		const deltaX = event.clientX - this.last.x;
		const deltaY = event.clientY - this.last.y;
		this.last = { x: event.clientX, y: event.clientY };
		this.onLook(deltaX, deltaY);
	}

	/** Releases only the pointer that actually owns battlefield look. */
	receiveRelease(event) {
		if (event.pointerId !== this.pointerId) return;
		event.preventDefault?.();
		this.malchusCanvas.releasePointerCapture?.(event.pointerId);
		this.pointerId = null;
		this.last = null;
	}

	/** Removes every listener and clears ownership deterministically. */
	dispose() {
		if (!this.malchusCanvas || !this.eventTarget) return false;
		this.malchusCanvas.removeEventListener("pointerdown", this.down);
		this.malchusCanvas.removeEventListener("lostpointercapture", this.release);
		this.eventTarget.removeEventListener("pointermove", this.move);
		this.eventTarget.removeEventListener("pointerup", this.release);
		this.eventTarget.removeEventListener("pointercancel", this.release);
		this.pointerId = null;
		this.last = null;
		return true;
	}
}
