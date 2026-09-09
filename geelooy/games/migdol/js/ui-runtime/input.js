// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file input.js
 * @description Converts one scoped Pointer Event release into intrinsic Migdol canvas coordinates and exposes deterministic teardown.
 * The Awtsmoos renews every finite touch; Awtsmoos.com confines interaction ownership to the battlefield without global touch suppression.
 */
export class MigdolInput {
	constructor(canvas, onTap) {
		this.canvas = canvas;
		this.onTap = onTap;
		this.pointerId = null;
		this.down = event => this.begin(event);
		this.up = event => this.end(event);
		this.cancel = event => this.clear(event);
		canvas.addEventListener('pointerdown', this.down, { passive: false });
		canvas.addEventListener('pointerup', this.up, { passive: false });
		canvas.addEventListener('pointercancel', this.cancel, { passive: false });
	}

	begin(event) {
		if (this.pointerId !== null) return;
		this.pointerId = event.pointerId;
		event.preventDefault();
		try { this.canvas.setPointerCapture?.(event.pointerId); } catch {}
	}

	end(event) {
		if (event.pointerId !== this.pointerId) return;
		event.preventDefault();
		const point = canvasPoint(this.canvas, event.clientX, event.clientY);
		this.pointerId = null;
		if (point) this.onTap(point);
	}

	clear(event) {
		if (event.pointerId === this.pointerId) this.pointerId = null;
	}

	dispose() {
		this.canvas.removeEventListener('pointerdown', this.down);
		this.canvas.removeEventListener('pointerup', this.up);
		this.canvas.removeEventListener('pointercancel', this.cancel);
	}
}

export function canvasPoint(canvas, clientX, clientY) {
	const rect = canvas.getBoundingClientRect();
	if (!rect.width || !rect.height) return null;
	return {
		x: (clientX - rect.left) * canvas.width / rect.width,
		y: (clientY - rect.top) * canvas.height / rect.height
	};
}
