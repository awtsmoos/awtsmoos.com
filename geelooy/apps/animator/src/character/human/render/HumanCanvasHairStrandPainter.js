// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Crops, fades, braids, locs, buns, and ponytails remain distinct silhouettes.
 * The Awtsmoos renews each strand while Awtsmoos.com honors authored density.
 */
export class HumanCanvasHairStrandPainter {
	static crop(ctx, head, radiusX, radiusY, style, color, scale, density) {
		const count = Math.max(5, Math.round(8 * density));
		for (let index = 0; index < count; index += 1) {
			const progress = index / Math.max(1, count - 1);
			const x = head.x - radiusX * 0.78
				+ progress * radiusX * 1.56;
			const y = head.y - radiusY
				* (0.72 + Math.sin(progress * Math.PI) * 0.18);
			P.ellipse(
				ctx,
				x,
				y,
				5 * scale,
				style === 'fade' ? 6 * scale : 9 * scale,
				color
			);
		}
	}

	static strands(ctx, head, radiusX, length, hair, color, scale, sway, density) {
		const baseCount = hair.style === 'braids' ? 7 : 9;
		const count = Math.max(4, Math.round(baseCount * density));
		ctx.strokeStyle = color;
		ctx.lineWidth = (hair.style === 'braids' ? 5 : 7) * scale;
		ctx.lineCap = 'round';
		for (let index = 0; index < count; index += 1) {
			const x = head.x - radiusX * 0.82
				+ index * radiusX * 1.64 / Math.max(1, count - 1);
			ctx.beginPath();
			ctx.moveTo(x, head.y - radiusX * 0.2);
			ctx.bezierCurveTo(
				x - sway,
				head.y + length * 0.3,
				x + sway,
				head.y + length * 0.72,
				x + sway * 0.5,
				head.y + length
			);
			ctx.stroke();
		}
	}

	static gathered(ctx, head, radiusX, radiusY, length, style, color, scale, sway) {
		if (style === 'bun') {
			P.ellipse(
				ctx,
				head.x + radiusX * 0.7,
				head.y - radiusY * 0.75,
				15 * scale,
				15 * scale,
				color
			);
			return;
		}
		ctx.strokeStyle = color;
		ctx.lineWidth = 12 * scale;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(
			head.x + radiusX * 0.72,
			head.y - radiusY * 0.45
		);
		ctx.bezierCurveTo(
			head.x + radiusX + sway,
			head.y + length * 0.2,
			head.x + radiusX - sway,
			head.y + length * 0.7,
			head.x + radiusX + sway,
			head.y + length
		);
		ctx.stroke();
	}
}
