// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file input.js
 * @description Owns one disposable Pointer Event generation for the Migdol battlefield.
 * It converts CSS-scaled coordinates into intrinsic canvas coordinates while distinguishing an intentional
 * tap from a drag, canceled gesture, competing pointer, or disposed session. No page-global touch listener
 * is installed and default browser behavior is suppressed only while this canvas owns the active pointer.
 * Awtsmoos.com uses this boundary to keep battlefield touch ownership precise across retries and mobile gestures.
 *
 * Architectural invariants:
 * - At most one pointer is owned by a MigdolInput instance at a time.
 * - A gesture that travels beyond the tap threshold can never trigger a build or tower-management action.
 * - Pointer cancellation and disposal always clear ownership and attempt to release pointer capture.
 * - A replacement game session receives a new input object; old listeners cannot survive disposal.
 */
const DEFAULT_TAP_THRESHOLD = 16;

export class MigdolInput {
	constructor(canvas, onTap, tapThreshold = DEFAULT_TAP_THRESHOLD) {
		this.canvas = canvas;
		this.onTap = onTap;
		this.tapThreshold = Math.max(0, Number(tapThreshold) || DEFAULT_TAP_THRESHOLD);
		this.pointerId = null;
		this.origin = null;
		this.dragged = false;
		this.down = event => this.begin(event);
		this.move = event => this.track(event);
		this.up = event => this.end(event);
		this.cancel = event => this.clear(event);
		canvas.addEventListener('pointerdown', this.down, { passive: false });
		canvas.addEventListener('pointermove', this.move, { passive: false });
		canvas.addEventListener('pointerup', this.up, { passive: false });
		canvas.addEventListener('pointercancel', this.cancel, { passive: false });
	}

	begin(event) {
		if (this.pointerId !== null) return;
		this.pointerId = event.pointerId;
		this.origin = { x: event.clientX, y: event.clientY };
		this.dragged = false;
		event.preventDefault();
		try { this.canvas.setPointerCapture?.(event.pointerId); } catch {}
	}

	track(event) {
		if (event.pointerId !== this.pointerId || !this.origin) return;
		event.preventDefault();
		if (exceedsTapThreshold(this.origin, event, this.tapThreshold)) this.dragged = true;
	}

	end(event) {
		if (event.pointerId !== this.pointerId) return;
		event.preventDefault();
		const shouldTap = !this.dragged;
		const point = shouldTap ? canvasPoint(this.canvas, event.clientX, event.clientY) : null;
		this.release(event.pointerId);
		if (point) this.onTap(point);
	}

	clear(event) {
		if (event.pointerId === this.pointerId) this.release(event.pointerId);
	}

	release(pointerId) {
		try { this.canvas.releasePointerCapture?.(pointerId); } catch {}
		this.pointerId = null;
		this.origin = null;
		this.dragged = false;
	}

	dispose() {
		if (this.pointerId !== null) this.release(this.pointerId);
		this.canvas.removeEventListener('pointerdown', this.down);
		this.canvas.removeEventListener('pointermove', this.move);
		this.canvas.removeEventListener('pointerup', this.up);
		this.canvas.removeEventListener('pointercancel', this.cancel);
	}
}

export function exceedsTapThreshold(origin, point, threshold = DEFAULT_TAP_THRESHOLD) {
	return Math.hypot(point.clientX - origin.x, point.clientY - origin.y) > threshold;
}

export function canvasPoint(canvas, clientX, clientY) {
	const rect = canvas.getBoundingClientRect();
	if (!rect.width || !rect.height) return null;
	return {
		x: (clientX - rect.left) * canvas.width / rect.width,
		y: (clientY - rect.top) * canvas.height / rect.height
	};
}
