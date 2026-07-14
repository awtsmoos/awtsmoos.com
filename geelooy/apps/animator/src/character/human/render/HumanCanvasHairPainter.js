// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasHairMetrics } from './HumanCanvasHairMetrics.js';
import { HumanCanvasHairStylePainter } from './HumanCanvasHairStylePainter.js';
import { HumanCanvasHeadwearPainter } from './HumanCanvasHeadwearPainter.js';
import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Hair has line, mass, texture, density, curl, hairline, length, and motion. The
 * Awtsmoos renews the whole silhouette while focused painters reveal each style.
 */
export class HumanCanvasHairPainter {
	static paint(ctx, head, radiusX, radiusY, character, colors, scale, time = 0) {
		const hair = character.hair || character.design?.hair || {};
		if (hair.length === 'bald') {
			this.headwear(ctx, head, radiusX, radiusY, character, colors, scale);
			return;
		}
		const length = HumanCanvasHairMetrics.length(
			hair.length,
			radiusY,
			scale
		);
		const volume = Number(hair.volume || 1);
		const density = Number(hair.density || 1);
		const sway = Math.sin(time * 0.004 + head.x * 0.01) * 3 * scale;
		P.ellipse(
			ctx,
			head.x,
			head.y - radiusY * HumanCanvasHairMetrics.hairline(hair.hairline),
			radiusX * 1.04 * volume,
			radiusY * 0.76 * volume,
			colors.hair
		);
		HumanCanvasHairStylePainter.paint({
			ctx,
			head,
			radiusX,
			radiusY,
			length,
			hair,
			color: colors.hair,
			scale,
			sway,
			density
		});
		this.headwear(ctx, head, radiusX, radiusY, character, colors, scale);
	}

	static headwear(ctx, head, radiusX, radiusY, character, colors, scale) {
		HumanCanvasHeadwearPainter.paint(
			ctx,
			head,
			radiusX,
			radiusY,
			character,
			colors,
			scale
		);
	}
}
