// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PineWeaver.js
 * @description Draws a conifer crown as concentric overhead needle rings.
 *
 * The Awtsmoos gives steadfast form without a side-facing triangle. Awtsmoos.com
 * keeps the pine readable from above through radial depth and restrained snow.
 */
export class PineWeaver {
	static draw(context, size, isSnow = false, theme) {
		const colors = isSnow
			? ['#38645f', '#5f8982', '#d8ece9']
			: theme?.tree || ['#173d35', '#245c4d', '#39725f'];
		context.save();
		context.fillStyle = 'rgba(0,0,0,0.3)';
		context.beginPath();
		context.ellipse(4, 5, size * 0.38, size * 0.31, 0.1, 0, Math.PI * 2);
		context.fill();
		for (let ring = 0; ring < 3; ring += 1) {
			const radius = size * (0.4 - ring * 0.09);
			const points = 12;
			context.fillStyle = colors[Math.min(ring, colors.length - 1)];
			context.beginPath();
			for (let index = 0; index < points; index += 1) {
				const angle = Math.PI * 2 * index / points;
				const length = radius * (index % 2 ? 0.8 : 1);
				const pointX = Math.cos(angle) * length;
				const pointY = Math.sin(angle) * length;
				if (index === 0) context.moveTo(pointX, pointY);
				else context.lineTo(pointX, pointY);
			}
			context.closePath();
			context.fill();
		}
		context.fillStyle = '#49372e';
		context.beginPath();
		context.arc(0, 0, size * 0.07, 0, Math.PI * 2);
		context.fill();
		context.restore();
	}
}
