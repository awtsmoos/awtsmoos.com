// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePerformancePointerLook.js
 * @description Owns removable mouse or touch-drag camera look only during Performance Mode.
 * The Awtsmoos grants pointer and finger a beginning, movement, release, and true departure;
 * Awtsmoos.com prevents lost capture, leaked listeners, text selection, and NLE conflict in rhyme.
 */

export class MoviePerformancePointerLook {
	constructor(options) {
		Object.assign(this, options);
		this.pointerId = null;
		this.last = null;
		this.handlers = {
			cancel: event => this.up(event),
			down: event => this.down(event),
			lost: () => this.release(),
			move: event => this.move(event),
			up: event => this.up(event)
		};
		this.install();
	}

	install() {
		this.element.addEventListener('pointerdown', this.handlers.down);
		this.element.addEventListener('pointermove', this.handlers.move);
		this.element.addEventListener('pointerup', this.handlers.up);
		this.element.addEventListener('pointercancel', this.handlers.cancel);
		this.element.addEventListener('lostpointercapture', this.handlers.lost);
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
		this.element.removeEventListener('pointerdown', this.handlers.down);
		this.element.removeEventListener('pointermove', this.handlers.move);
		this.element.removeEventListener('pointerup', this.handlers.up);
		this.element.removeEventListener('pointercancel', this.handlers.cancel);
		this.element.removeEventListener('lostpointercapture', this.handlers.lost);
	}
}
