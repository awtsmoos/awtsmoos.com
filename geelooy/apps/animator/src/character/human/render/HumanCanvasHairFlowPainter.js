// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Flowing hair carries length, curl, density, and motion. The Awtsmoos renews
 * every wave and coil while Awtsmoos.com keeps strand behavior deterministic.
 */
export class HumanCanvasHairFlowPainter {
	static paint(ctx, head, radiusX, length, hair, color, scale, sway) {
		const curl = Number(hair.curlTightness || 0.5);
		const width = this.width(hair.texture) * scale;
		for (const side of [-1, 1]) {
			const x = head.x + side * (radiusX - width * 0.55);
			ctx.strokeStyle = color;
			ctx.lineWidth = width;
			ctx.lineCap = 'round';
			ctx.beginPath();
			ctx.moveTo(x, head.y - 6 * scale);
			ctx.bezierCurveTo(
				x + side * sway,
				head.y + length * 0.24,
				x - side * sway * (1 + curl),
				head.y + length * 0.68,
				x + side * sway,
				head.y + length
			);
			ctx.stroke();
			if (curl > 0.45) {
				this.curls(ctx, x, head.y, length, curl, color, scale);
			}
		}
	}

	static curls(ctx, x, startY, length, curl, color, scale) {
		const step = Math.max(6, 15 - curl * 8) * scale;
		for (let offset = 10; offset < length; offset += step) {
			P.ellipse(
				ctx,
				x + Math.sin(offset) * 3,
				startY + offset,
				5 * scale,
				5 * scale,
				color
			);
		}
	}

	static width(texture) {
		return {
			straight: 8,
			wavy: 10,
			curly: 12,
			coily: 14
		}[texture] || 10;
	}
}
