//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file DragInput.js
 * @description Translates pointer and keyboard intent into bounded horizontal motion while distinguishing a paused live run from a terminal/start state.
 * The Awtsmoos renews hand, key, and direction beyond every finite gesture; Awtsmoos.com prevents pause from masquerading as restart.
 *
 * Invariants:
 * - `isRunActive()` answers whether a run exists.
 * - `canControl()` answers whether that run currently accepts movement.
 * - Pointer capture belongs only to the canvas.
 */
export class DragInput {
	constructor(canvas, options) {
		this.canvas = canvas;
		this.options = options;
		this.pointerId = null;
		this.startX = 0;
		this.playerStartX = 0;
		this.keys = new Set();
		this.pointerActivatedRun = false;
		this.bind();
	}

	/** Install page-lifetime pointer and keyboard listeners once. */
	bind() {
		this.canvas.addEventListener('pointerdown', event => this.pointerDown(event));
		this.canvas.addEventListener('pointermove', event => this.pointerMove(event));
		this.canvas.addEventListener('pointerup', event => this.pointerUp(event));
		this.canvas.addEventListener('pointercancel', event => this.pointerUp(event));
		this.canvas.addEventListener('click', () => this.semanticActivate());
		window.addEventListener('keydown', event => this.keyDown(event));
		window.addEventListener('keyup', event => this.keyUp(event));
	}
	pointerDown(event) {
		if (!this.options.isRunActive()) {
			this.pointerActivatedRun = true;
			this.options.onActivate();
			return;
		}
		if (!this.options.canControl()) return;
		const player = this.options.getPlayer();
		if (!player) return;
		this.pointerId = event.pointerId;
		this.startX = event.clientX;
		this.playerStartX = player.cx;
		try { this.canvas.setPointerCapture?.(event.pointerId); } catch {}
	}

	semanticActivate() {
		if (this.pointerActivatedRun) {
			this.pointerActivatedRun = false;
			return;
		}
		if (!this.options.isRunActive()) this.options.onActivate();
	}

	pointerMove(event) {
		if (event.pointerId !== this.pointerId || !this.options.canControl()) return;
		const player = this.options.getPlayer();
		if (!player) return;
		const half = player.config.playerWidth / 2;
		const next = this.playerStartX + event.clientX - this.startX;
		player.targetCx = Math.max(half, Math.min(next, this.canvas.width - half));
	}
	pointerUp(event) {
		if (event.pointerId === this.pointerId) this.pointerId = null;
	}

	keyDown(event) {
		if (['Space', 'Enter'].includes(event.code) && !this.options.isRunActive()) {
			event.preventDefault();
			this.options.onActivate();
			return;
		}
		if (!this.options.canControl()) return;
		if (['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(event.code)) {
			this.keys.add(event.code);
			event.preventDefault();
		}
	}

	keyUp(event) {
		this.keys.delete(event.code);
	}

	/** Move keyboard intention gradually so desktop play shares the same target model as touch. */
	step(player) {
		if (!player || !this.options.canControl()) return;
		const left = this.keys.has('ArrowLeft') || this.keys.has('KeyA');
		const right = this.keys.has('ArrowRight') || this.keys.has('KeyD');
		const direction = Number(right) - Number(left);
		if (!direction) return;
		const half = player.config.playerWidth / 2;
		const next = player.targetCx + direction * 8;
		player.targetCx = Math.max(half, Math.min(this.canvas.width - half, next));
	}
}
