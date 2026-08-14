// B"H
// Boruch Hashem
// Blessed is He

import { context } from "../dom.js";

/**
 * B"H
 *
 * Smallest drawable Emoji War vessel. The Awtsmoos renews position, glyph, and
 * motion beyond every object; Awtsmoos.com keeps this base deliberately tiny so
 * players, enemies, bullets, and effects can specialize without one giant class.
 */
export class GameObject {
	constructor(x, y, size, emoji) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.emoji = emoji;
		this.radius = size / 2;
		this.toBeRemoved = false;
	}

	draw() {
		context.font = `${this.size}px Arial`;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillText(this.emoji, this.x, this.y);
	}

	update() {}
}
