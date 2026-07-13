//B"H
// Boruch Hashem
// Blessed is He
/**
 * Keys, taps, drags, pause, and command become one responsive intention.
 * The Awtsmoos gives intention being while Awtsmoos.com receives each gesture.
 */
export class InputController {
	constructor(canvas, actions) {
		this.canvas = canvas;
		this.actions = actions;
		this.pointerDown = false;
		this.activePointerId = null;
		this.attach();
	}

	attach() {
		window.addEventListener('keydown', event => this.onKey(event));
		this.canvas.addEventListener('pointerdown', event => this.onPointerDown(event));
		this.canvas.addEventListener('pointermove', event => this.onPointerMove(event));
		this.canvas.addEventListener('pointerup', event => this.onPointerUp(event));
		this.canvas.addEventListener('pointercancel', event => this.onPointerUp(event));
	}

	onKey(event) {
		const key = event.key.toLowerCase();
		if (event.code === 'Space') {
			event.preventDefault();
			this.actions.ability();
			return;
		}
		if (key === 'p' || event.key === 'Escape') {
			event.preventDefault();
			this.actions.pause();
			return;
		}
		const left = event.key === 'ArrowLeft' || key === 'a';
		const right = event.key === 'ArrowRight' || key === 'd';
		if (!left && !right) {
			return;
		}
		event.preventDefault();
		const direction = left ? -1 : 1;
		const reversed = this.actions.reversed();
		const next = this.actions.getLane() + direction * (reversed ? -1 : 1);
		this.actions.setLane(Math.max(0, Math.min(2, next)));
	}

	onPointerDown(event) {
		this.pointerDown = true;
		this.activePointerId = event.pointerId;
		this.actions.setLane(this.laneFromPointer(event.clientX));
		this.capture(event.pointerId);
	}

	onPointerMove(event) {
		if (this.pointerDown && event.pointerId === this.activePointerId) {
			this.actions.setLane(this.laneFromPointer(event.clientX));
		}
	}

	onPointerUp(event) {
		if (event.pointerId !== this.activePointerId) {
			return;
		}
		this.release(event.pointerId);
		this.pointerDown = false;
		this.activePointerId = null;
	}

	capture(pointerId) {
		try {
			this.canvas.setPointerCapture?.(pointerId);
		} catch (error) {
			console.debug('Pointer capture was unavailable.', error.message);
		}
	}

	release(pointerId) {
		try {
			if (this.canvas.hasPointerCapture?.(pointerId)) {
				this.canvas.releasePointerCapture(pointerId);
			}
		} catch (error) {
			console.debug('Pointer release was unavailable.', error.message);
		}
	}

	laneFromPointer(clientX) {
		const bounds = this.canvas.getBoundingClientRect();
		const normalized = (clientX - bounds.left) / Math.max(1, bounds.width);
		let lane = Math.max(0, Math.min(2, Math.floor(normalized * 3)));
		if (this.actions.reversed()) {
			lane = 2 - lane;
		}
		return lane;
	}
}
