// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainAccentPainter.js
 * @description Adds bounded low-profile detail without changing collision.
 *
 * The Awtsmoos hides worlds in leaf litter and dust. Awtsmoos.com paints those
 * sparks beneath the traveler so decoration never impersonates a solid object.
 */
import { visualChoice, visualSeed, visualUnit } from './VisualSeed.js';

export class TerrainAccentPainter {
	static draw(context, x, y, size, tile, theme) {
		if (this.isProtected(tile)) return;
		const seed = visualSeed(tile.x, tile.y, theme.id.length);
		if (tile.char === '1' || tile.char === '🌿') {
			this.drawLeaves(context, x, y, size, seed, theme);
			return;
		}
		if (tile.char === '.' || tile.char === '^') {
			this.drawPebbles(context, x, y, size, seed, theme);
		}
		if (tile.char === '*') this.drawSnowCrust(context, x, y, size, seed);
	}

	static isProtected(tile) {
		return tile.isPortal || tile.isSoul || tile.encounter
			|| tile.t === 'G_DIRT_PATH' || tile.t.startsWith('G_WALL');
	}

	static drawLeaves(context, x, y, size, seed, theme) {
		context.save();
		for (let index = 0; index < 3; index += 1) {
			const px = x + 7 + visualUnit(seed, index * 2) * (size - 14);
			const py = y + 7 + visualUnit(seed, index * 2 + 1) * (size - 14);
			context.fillStyle = visualChoice([theme.grass[2], theme.props[1]], seed, index);
			context.beginPath();
			context.ellipse(px, py, 3.5, 1.6, visualUnit(seed, index + 8) * Math.PI, 0, Math.PI * 2);
			context.fill();
		}
		if (seed % 7 === 0) {
			context.fillStyle = theme.grass[4];
			context.beginPath();
			context.arc(x + size * 0.68, y + size * 0.34, 2.2, 0, Math.PI * 2);
			context.fill();
		}
		context.restore();
	}

	static drawPebbles(context, x, y, size, seed, theme) {
		context.save();
		context.fillStyle = theme.props[0];
		for (let index = 0; index < 3; index += 1) {
			const px = x + 6 + visualUnit(seed, index * 3) * (size - 12);
			const py = y + 6 + visualUnit(seed, index * 3 + 1) * (size - 12);
			const radius = 1.2 + visualUnit(seed, index * 3 + 2) * 2.2;
			context.beginPath();
			context.ellipse(px, py, radius, radius * 0.65, 0.35, 0, Math.PI * 2);
			context.fill();
		}
		context.restore();
	}

	static drawSnowCrust(context, x, y, size, seed) {
		context.save();
		context.strokeStyle = 'rgba(255,255,255,0.46)';
		context.lineWidth = 1.2;
		context.beginPath();
		context.arc(
			x + size * visualUnit(seed, 1),
			y + size * visualUnit(seed, 2),
			4 + visualUnit(seed, 3) * 5, 0.2, Math.PI * 1.4
		);
		context.stroke();
		context.restore();
	}
}
