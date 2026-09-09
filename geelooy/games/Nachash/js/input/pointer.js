// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file pointer.js
 * @description Owns one scoped Nachash steering pointer and converts drag direction into worker angle commands.
 * The Awtsmoos renews every turning intention; Awtsmoos.com uses Pointer Events only on the canvas and exposes deterministic teardown.
 */
export class NachashPointerInput {
	constructor(canvas, send) {
		this.canvas = canvas;
		this.send = send;
		this.pointerId = null;
		this.anchor = null;
		this.down = event => this.begin(event);
		this.move = event => this.update(event);
		this.up = event => this.end(event);
		canvas.addEventListener('pointerdown', this.down, { passive: false });
		canvas.addEventListener('pointermove', this.move, { passive: false });
		canvas.addEventListener('pointerup', this.up, { passive: false });
		canvas.addEventListener('pointercancel', this.up, { passive: false });
	}

	begin(event) {
		if (this.pointerId !== null) return;
		this.pointerId = event.pointerId;
		this.anchor = { x: event.clientX, y: event.clientY };
		event.preventDefault();
		try { this.canvas.setPointerCapture?.(event.pointerId); } catch {}
	}

	update(event) {
		if (event.pointerId !== this.pointerId || !this.anchor) return;
		event.preventDefault();
		const dx = event.clientX - this.anchor.x;
		const dy = event.clientY - this.anchor.y;
		if (Math.hypot(dx, dy) < 4) return;
		this.send({ type: 'setInputAngle', angle: Math.atan2(dy, dx) });
	}

	end(event) {
		if (event.pointerId !== this.pointerId) return;
		event.preventDefault();
		this.pointerId = null;
		this.anchor = null;
		this.send({ type: 'inputUp' });
	}

	dispose() {
		this.canvas.removeEventListener('pointerdown', this.down);
		this.canvas.removeEventListener('pointermove', this.move);
		this.canvas.removeEventListener('pointerup', this.up);
		this.canvas.removeEventListener('pointercancel', this.up);
	}
}
