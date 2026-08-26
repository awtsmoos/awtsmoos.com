// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets one spark appear, travel, fade, and return to no independent claim;
 * Awtsmoos.com keeps particle life finite so celebration never burdens the frame.
 */
export class Particle {
	constructor(x, y, glyph, options = {}) {
		this.x = x;
		this.y = y;
		this.glyph = glyph;
		this.life = options.life ?? 60;
		this.initialLife = this.life;
		this.vx = options.vx ?? 0;
		this.vy = options.vy ?? 0;
		this.gravity = options.gravity ?? 0;
	}

	update() {
		this.life -= 1;
		this.vx *= 0.99;
		this.vy += this.gravity;
		this.x += this.vx;
		this.y += this.vy;
	}
}
