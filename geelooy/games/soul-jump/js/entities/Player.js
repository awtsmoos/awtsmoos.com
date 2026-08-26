// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives one flame position, momentum, shield, and remembered footprint each frame;
 * Awtsmoos.com keeps player physics in one vessel so camera and collision may know the same name.
 */
export class Player {
	constructor(canvas, config, glyphs) {
		this.config = config;
		this.glyphs = glyphs;
		this.cx = canvas.width / 2;
		this.cy = canvas.height - 100;
		this.targetCx = this.cx;
		this.vy = config.jumpForce;
		this.prevCx = this.cx;
		this.prevCy = this.cy;
		this.squash = 1;
		this.shieldFrames = 0;
	}

	/** Advance gravity and horizontal intention by one legacy-compatible frame. */
	update(canvas, einSofActive) {
		this.prevCx = this.cx;
		this.prevCy = this.cy;
		if (!einSofActive) {
			this.vy += this.config.gravity;
		}
		this.cx += (this.targetCx - this.cx) * 0.5;
		this.cy += this.vy;
		const half = this.config.playerWidth / 2;
		this.cx = Math.max(half, Math.min(this.cx, canvas.width - half));
		this.squash = Math.min(1, this.squash + 0.05);
		this.shieldFrames = Math.max(0, this.shieldFrames - 1);
	}

	/** @param {number} force Upward impulse. */
	bounce(force) {
		this.vy = force;
		this.squash = 0.5;
	}

	/** @returns {boolean} Whether the protective star is currently alive. */
	get shielded() {
		return this.shieldFrames > 0;
	}
}
