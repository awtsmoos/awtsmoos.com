// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos translates finger, mouse, semantic click, and key into one bounded horizontal intention;
 * Awtsmoos.com keeps input separate from physics so every doorway can awaken the same creation.
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
		if (!this.options.isPlaying()) {
			this.pointerActivatedRun = true;
			this.options.onActivate();
			return;
		}

		const player = this.options.getPlayer();
		if (!player) {
			return;
		}

		this.pointerId = event.pointerId;
		this.startX = event.clientX;
		this.playerStartX = player.cx;
		this.canvas.setPointerCapture?.(event.pointerId);
	}

	semanticActivate() {
		if (this.pointerActivatedRun) {
			this.pointerActivatedRun = false;
			return;
		}

		if (!this.options.isPlaying()) {
			this.options.onActivate();
		}
	}

	pointerMove(event) {
		if (event.pointerId !== this.pointerId || !this.options.isPlaying()) {
			return;
		}

		const player = this.options.getPlayer();
		const half = player.config.playerWidth / 2;
		const next = this.playerStartX + event.clientX - this.startX;
		player.targetCx = Math.max(half, Math.min(next, this.canvas.width - half));
	}

	pointerUp(event) {
		if (event.pointerId === this.pointerId) {
			this.pointerId = null;
		}
	}

	keyDown(event) {
		if (['Space', 'Enter'].includes(event.code) && !this.options.isPlaying()) {
			event.preventDefault();
			this.options.onActivate();
			return;
		}

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
		if (!player) {
			return;
		}

		const left = this.keys.has('ArrowLeft') || this.keys.has('KeyA');
		const right = this.keys.has('ArrowRight') || this.keys.has('KeyD');
		const direction = Number(right) - Number(left);
		if (!direction) {
			return;
		}

		const half = player.config.playerWidth / 2;
		const next = player.targetCx + direction * 8;
		player.targetCx = Math.max(half, Math.min(this.canvas.width - half, next));
	}
}
