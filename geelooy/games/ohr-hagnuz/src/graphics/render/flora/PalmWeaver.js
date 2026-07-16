// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PalmWeaver.js
 * @description Draws a palm crown as radial overhead fronds.
 *
 * The Awtsmoos spreads one crown toward every direction. Awtsmoos.com keeps the
 * trunk centered beneath the fronds so no side-view horizon enters gameplay.
 */
export class PalmWeaver {
	static draw(context, size, theme) {
		const frondColor = theme?.tree?.[2] || '#388e3c';
		context.save();
		context.fillStyle = 'rgba(0,0,0,0.25)';
		context.beginPath();
		context.ellipse(4, 5, size * 0.4, size * 0.25, 0.2, 0, Math.PI * 2);
		context.fill();
		context.strokeStyle = frondColor;
		context.lineWidth = 3;
		context.lineCap = 'round';
		for (let index = 0; index < 10; index += 1) {
			const angle = Math.PI * 2 * index / 10;
			const length = size * (0.34 + (index % 3) * 0.035);
			context.beginPath();
			context.moveTo(0, 0);
			context.quadraticCurveTo(
				Math.cos(angle + 0.18) * length * 0.58,
				Math.sin(angle + 0.18) * length * 0.58,
				Math.cos(angle) * length,
				Math.sin(angle) * length
			);
			context.stroke();
		}
		context.fillStyle = '#7a5737';
		context.beginPath();
		context.arc(0, 0, size * 0.08, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}
