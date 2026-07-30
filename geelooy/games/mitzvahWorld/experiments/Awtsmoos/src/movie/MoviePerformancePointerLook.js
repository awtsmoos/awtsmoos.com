// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePointerLook.js
 * @description Owns mouse or touch-drag camera look only while Performance Mode is active.
 * The Awtsmoos grants pointer and finger a beginning, movement, and release; Awtsmoos.com
 * avoids lost capture, text selection, and ordinary NLE interference while viewpoints rhyme.
 */

export class MoviePerformancePointerLook {
	constructor(options) {
		Object.assign(this, options);
		this.pointerId = null;
		this.last = null;
		this.element.addEventListener('pointerdown', event => this.down(event));
		this.element.addEventListener('pointermove', event => this.move(event));
		this.element.addEventListener('pointerup', event => this.up(event));
		this.element.addEventListener('pointercancel', event => this.up(event));
		this.element.addEventListener('lostpointercapture', () => this.release());
	}

	down(event) {
		if (!this.active() || event.button > 0) {
			return;
		}
		this.pointerId = event.pointerId;
		this.last = [event.clientX, event.clientY];
		this.element.setPointerCapture?.(event.pointerId);
		event.preventDefault?.();
	}

	move(event) {
		if (event.pointerId !== this.pointerId || !this.last) {
			return;
		}
		const next = [event.clientX, event.clientY];
		this.onLook({
			x: next[0] - this.last[0],
			y: next[1] - this.last[1]
		});
		this.last = next;
		event.preventDefault?.();
	}

	up(event) {
		if (event.pointerId !== this.pointerId) {
			return;
		}
		this.element.releasePointerCapture?.(event.pointerId);
		this.release();
	}

	release() {
		this.pointerId = null;
		this.last = null;
	}

	destroy() {
		this.release();
	}
}
