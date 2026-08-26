// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets a finite adversary patrol a measured span but never own the road;
 * Awtsmoos.com keeps enemy motion explicit so collisions carry a testable load.
 */
export class Enemy {
	constructor(x, y, glyphs, worldLevel = 0) {
		this.x = x;
		this.y = y;
		this.size = 30;
		this.glyph = glyphs.klippot[Math.floor(Math.random() * glyphs.klippot.length)];
		this.originX = x;
		this.patrolRange = 30 + Math.random() * 20;
		this.dx = (Math.random() < 0.5 ? -0.5 : 0.5) * (1 + worldLevel * 0.3);
	}

	update() {
		this.x += this.dx;
		const minimum = this.originX - this.patrolRange;
		const maximum = this.originX + this.patrolRange;
		if (this.x < minimum || this.x > maximum) {
			this.dx *= -1;
			this.x = Math.max(minimum, Math.min(maximum, this.x));
		}
	}
}
