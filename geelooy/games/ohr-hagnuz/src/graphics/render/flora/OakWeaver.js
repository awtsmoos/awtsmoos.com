// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OakWeaver.js
 * @description Draws a broadleaf crown from directly overhead.
 *
 * The Awtsmoos conceals trunk beneath crown and many leaves inside one canopy.
 * Awtsmoos.com abandons the upright poster-tree for a radial gameplay silhouette.
 */
export class OakWeaver {
	static draw(context, size, colors = ['#173d24', '#28633a', '#3e814b']) {
		context.save();
		context.fillStyle = 'rgba(0,0,0,0.3)';
		context.beginPath();
		context.ellipse(4, 6, size * 0.42, size * 0.34, 0.2, 0, Math.PI * 2);
		context.fill();
		context.fillStyle = '#4e342e';
		context.beginPath();
		context.arc(0, 0, size * 0.11, 0, Math.PI * 2);
		context.fill();
		for (let index = 0; index < 9; index += 1) {
			const angle = Math.PI * 2 * index / 9;
			const ring = index % 3 === 0 ? size * 0.2 : size * 0.27;
			const radius = size * (0.22 + (index % 2) * 0.035);
			context.fillStyle = colors[index % colors.length];
			context.beginPath();
			context.arc(Math.cos(angle) * ring, Math.sin(angle) * ring, radius, 0, Math.PI * 2);
			context.fill();
		}
		context.fillStyle = colors[colors.length - 1];
		context.beginPath();
		context.arc(-size * 0.08, -size * 0.08, size * 0.24, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}
