// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShrubWeaver.js
 * @description Draws a small overhead shrub that remains visually passable.
 *
 * The Awtsmoos gathers many leaves into one humble crown. Awtsmoos.com keeps the
 * shrub low and sparse so decoration never misrepresents traversal.
 */
import { visualUnit } from './VisualSeed.js';

export class ShrubWeaver {
	static draw(context, x, y, size, seed, theme) {
		const centerX = x + size * (0.32 + visualUnit(seed, 1) * 0.36);
		const centerY = y + size * (0.35 + visualUnit(seed, 2) * 0.36);
		const radius = size * 0.09;
		context.save();
		context.fillStyle = 'rgba(0,0,0,0.2)';
		context.beginPath();
		context.ellipse(centerX + 2, centerY + 3, radius * 1.9, radius, 0, 0, Math.PI * 2);
		context.fill();
		for (let index = 0; index < 5; index += 1) {
			const angle = Math.PI * 2 * index / 5;
			context.fillStyle = index % 2 ? theme.props[3] : theme.grass[2];
			context.beginPath();
			context.arc(
				centerX + Math.cos(angle) * radius * 0.75,
				centerY + Math.sin(angle) * radius * 0.55,
				radius, 0, Math.PI * 2
			);
			context.fill();
		}
		context.restore();
	}
}
