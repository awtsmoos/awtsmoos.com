// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassTuftWeaver.js
 * @description Draws a small overhead grass cluster with a regional base color.
 *
 * The Awtsmoos renews each blade without separating it from the land that bears
 * it. Awtsmoos.com lets the current region tint the tuft while variation stays stable.
 */
export class GrassTuftWeaver {
	/**
	 * Draws a bounded tuft at a stable position.
	 * @param {CanvasRenderingContext2D} context - Ground canvas vessel.
	 * @param {number} x - Horizontal canvas position.
	 * @param {number} y - Vertical canvas position.
	 * @param {number} seed - Deterministic visual seed.
	 * @param {string} color - Regional blade color.
	 */
	static weave(context, x, y, seed, color = '#43a047') {
		context.save();
		context.translate(x, y);
		const stableSeed = Math.abs(seed);
		const bladeCount = 2 + (stableSeed % 3);
		context.lineCap = 'round';
		for (let index = 0; index < bladeCount; index += 1) {
			const angle = (index - bladeCount / 2) * 0.4;
			const height = 5 + ((stableSeed + index) % 8);
			context.strokeStyle = index % 2 === 0
				? color
				: this.shadowColor(color);
			context.lineWidth = 1.5 + (stableSeed % 1.5);
			context.beginPath();
			context.moveTo(0, 0);
			context.quadraticCurveTo(
				Math.sin(angle) * height / 2,
				-height / 2,
				Math.sin(angle) * height,
				-height
			);
			context.stroke();
		}
		context.restore();
	}

	static shadowColor(color) {
		const match = /^#([0-9a-f]{6})$/i.exec(color);
		if (!match) return color;
		const value = Number.parseInt(match[1], 16);
		const channels = [value >> 16, value >> 8 & 255, value & 255]
			.map(channel => Math.max(0, Math.round(channel * 0.72)));
		return `rgb(${channels.join(',')})`;
	}
}
