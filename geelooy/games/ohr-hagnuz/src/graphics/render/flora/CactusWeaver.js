// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CactusWeaver.js
 * @description Draws a desert cactus crown from directly overhead.
 *
 * The Awtsmoos sustains life in dryness. Awtsmoos.com replaces the upright cactus
 * poster with clustered lobes and radial needles visible from the gameplay camera.
 */
export class CactusWeaver {
	static draw(context, size, theme) {
		const body = theme?.tree?.[1] || '#2e7d32';
		context.save();
		context.fillStyle = 'rgba(0,0,0,0.25)';
		context.beginPath();
		context.ellipse(3, 4, size * 0.28, size * 0.22, 0, 0, Math.PI * 2);
		context.fill();
		const lobes = [[0, 0, 0.18], [-0.18, 0.04, 0.12], [0.17, -0.06, 0.13]];
		for (const [offsetX, offsetY, radius] of lobes) {
			context.fillStyle = body;
			context.beginPath();
			context.ellipse(
				offsetX * size, offsetY * size, radius * size, radius * size * 0.78,
				offsetX, 0, Math.PI * 2
			);
			context.fill();
		}
		context.fillStyle = '#d9ead4';
		for (let index = 0; index < 10; index += 1) {
			const angle = Math.PI * 2 * index / 10;
			context.fillRect(Math.cos(angle) * size * 0.14, Math.sin(angle) * size * 0.11, 1.5, 1.5);
		}
		context.restore();
	}
}
