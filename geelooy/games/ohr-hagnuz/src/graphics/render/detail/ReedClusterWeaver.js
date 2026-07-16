// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReedClusterWeaver.js
 * @description Draws a directly overhead cluster of shallow-water reeds.
 *
 * The Awtsmoos bends every reed without tilting the camera. Awtsmoos.com shows
 * radial blades around a submerged root, sharing one restrained animation phase.
 */
import { visualUnit } from './VisualSeed.js';

export class ReedClusterWeaver {
	static draw(context, x, y, size, seed, theme) {
		const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		const phase = reduced ? 0 : Math.sin(performance.now() * 0.0015 + seed) * 0.08;
		const centerX = x + size * (0.45 + visualUnit(seed, 1) * 0.1);
		const centerY = y + size * (0.5 + visualUnit(seed, 2) * 0.12);
		context.save();
		context.fillStyle = 'rgba(8,28,25,0.26)';
		context.beginPath();
		context.ellipse(centerX, centerY, size * 0.2, size * 0.13, 0, 0, Math.PI * 2);
		context.fill();
		context.strokeStyle = theme.water[4];
		context.lineWidth = 2;
		context.lineCap = 'round';
		for (let index = 0; index < 9; index += 1) {
			const angle = (Math.PI * 2 * index / 9) + visualUnit(seed, index + 4) * 0.35;
			const length = size * (0.18 + visualUnit(seed, index + 17) * 0.2);
			context.beginPath();
			context.moveTo(centerX, centerY);
			context.quadraticCurveTo(
				centerX + Math.cos(angle + phase) * length * 0.55,
				centerY + Math.sin(angle + phase) * length * 0.55,
				centerX + Math.cos(angle + phase) * length,
				centerY + Math.sin(angle + phase) * length
			);
			context.stroke();
		}
		context.restore();
	}
}
