// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Headwear belongs to the same silhouette as hair and face. The Awtsmoos renews
 * cap, hat, beanie, scarf, and headband while Awtsmoos.com preserves clear layers.
 */
export class HumanCanvasHeadwearPainter {
	static paint(ctx, head, radiusX, radiusY, character, colors, scale) {
		const type = character.clothing?.headwear
			|| character.design?.wardrobe?.headwear
			|| 'none';
		if (type === 'none') {
			return;
		}
		if (type === 'headband') {
			P.roundRect(
				ctx,
				head.x - radiusX,
				head.y - radiusY * 0.55,
				radiusX * 2,
				7 * scale,
				3 * scale,
				colors.accent
			);
			return;
		}
		if (type === 'scarf') {
			P.roundRect(
				ctx,
				head.x - radiusX * 0.92,
				head.y - radiusY * 0.78,
				radiusX * 1.84,
				radiusY * 0.5,
				12 * scale,
				colors.accent
			);
			return;
		}
		P.ellipse(
			ctx,
			head.x,
			head.y - radiusY * 0.85,
			radiusX * 0.9,
			12 * scale,
			colors.accent
		);
		P.roundRect(
			ctx,
			head.x - radiusX * 0.58,
			head.y - radiusY * 1.25,
			radiusX * 1.16,
			radiusY * 0.52,
			8 * scale,
			colors.accent
		);
	}
}
