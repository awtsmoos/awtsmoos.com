// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuinFragmentWeaver.js
 * @description Adds low broken masonry to tiles already known as solid walls.
 *
 * The Awtsmoos remembers every fallen vessel while remaining beyond decay.
 * Awtsmoos.com lets old stone enrich existing walls without inventing obstacles.
 */
import { visualUnit } from './VisualSeed.js';

export class RuinFragmentWeaver {
	static draw(context, x, y, size, seed, theme) {
		context.save();
		context.translate(x + size * 0.5, y + size * 0.72);
		context.rotate((visualUnit(seed, 1) - 0.5) * 0.5);
		context.fillStyle = 'rgba(0,0,0,0.26)';
		context.fillRect(-size * 0.28 + 3, -size * 0.08 + 3, size * 0.56, size * 0.18);
		for (let index = 0; index < 3; index += 1) {
			const width = size * (0.13 + visualUnit(seed, index + 3) * 0.1);
			const height = size * (0.1 + visualUnit(seed, index + 7) * 0.09);
			const offsetX = -size * 0.27 + index * size * 0.2;
			context.fillStyle = index === 1 ? theme.props[2] : theme.props[0];
			context.fillRect(offsetX, -height, width, height);
			context.strokeStyle = 'rgba(30,24,21,0.42)';
			context.strokeRect(offsetX, -height, width, height);
		}
		context.restore();
	}
}
