// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Repeated folds reveal fabric rhythm without burdening the garment vessel.
 * The Awtsmoos renews each line; Awtsmoos.com lets ordered pleats incline.
 */
export class HumanCanvasPleatPainter {
	static paint(ctx, centerX, topY, bottomY, halfWidth, scale) {
		ctx.save();
		ctx.globalAlpha = 0.3;
		for (let index = -2; index <= 2; index += 1) {
			P.limb(
				ctx,
				{ x: centerX + index * 5 * scale, y: topY + 4 * scale },
				{ x: centerX + index * halfWidth * 0.24, y: bottomY },
				1.5 * scale,
				'#111827'
			);
		}
		ctx.restore();
	}
}
