//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file starfield.js
 * @description Owns a bounded decorative star field for one Tetris board without participating in simulation truth.
 * Awtsmoos.com lets ambience scale with board geometry while keeping a hard star ceiling and deterministic disposal.
 *
 * Invariants:
 * - Star count remains bounded regardless of viewport size or level.
 * - Resize rebuilds decoration from current canvas dimensions rather than retaining stale coordinates.
 * - Draw and update are optional presentation work; gameplay never reads star state.
 */
const MAX_STARS = 72;

export class Starfield {
	constructor(context, width, height) {
		this.context = context;
		this.resize(width, height);
	}

	resize(width, height) {
		this.width = width;
		this.height = height;
		const count = Math.min(
			MAX_STARS,
			Math.max(20, Math.floor(width * height / 16000))
		);
		this.stars = Array.from(
			{ length: count },
			() => this.create(true)
		);
	}

	create(initial = false) {
		return {
			x: Math.random() * this.width,
			y: initial ? Math.random() * this.height : -4,
			speed: 0.18 + Math.random() * 0.7,
			size: 0.6 + Math.random() * 1.7,
			opacity: 0.2 + Math.random() * 0.6
		};
	}

	update(level = 1) {
		const multiplier = Math.min(2.2, 1 + level * 0.04);
		for (let index = 0; index < this.stars.length; index += 1) {
			this.stars[index].y += this.stars[index].speed * multiplier;
			if (this.stars[index].y > this.height) {
				this.stars[index] = this.create();
			}
		}
	}
	draw() {
		for (const star of this.stars) {
			this.context.globalAlpha = star.opacity;
			this.context.fillStyle = '#ffffff';
			this.context.fillRect(star.x, star.y, star.size, star.size);
		}
		this.context.globalAlpha = 1;
	}

	dispose() {
		this.stars.length = 0;
	}
}
