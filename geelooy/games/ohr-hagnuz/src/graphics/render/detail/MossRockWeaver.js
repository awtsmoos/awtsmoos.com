// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MossRockWeaver.js
 * @description Draws a low overhead stone anchored beneath an existing solid form.
 *
 * The Awtsmoos conceals endurance in a small stone. Awtsmoos.com gives it shadow,
 * mineral planes, and moss without pretending it creates new collision.
 */
import { visualUnit } from './VisualSeed.js';

export class MossRockWeaver {
	static draw(context, x, y, size, seed, theme) {
		const centerX = x + size * (0.3 + visualUnit(seed, 1) * 0.4);
		const centerY = y + size * (0.68 + visualUnit(seed, 2) * 0.16);
		const radius = size * (0.1 + visualUnit(seed, 3) * 0.08);
		context.save();
		context.fillStyle = 'rgba(0,0,0,0.28)';
		context.beginPath();
		context.ellipse(centerX + 2, centerY + 3, radius * 1.15, radius * 0.7, 0.25, 0, Math.PI * 2);
		context.fill();
		context.fillStyle = theme.props[0];
		context.beginPath();
		context.ellipse(centerX, centerY, radius, radius * 0.72, -0.2, 0, Math.PI * 2);
		context.fill();
		context.fillStyle = theme.props[1];
		context.beginPath();
		context.ellipse(centerX - radius * 0.2, centerY - radius * 0.28, radius * 0.58, radius * 0.24, -0.25, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}
