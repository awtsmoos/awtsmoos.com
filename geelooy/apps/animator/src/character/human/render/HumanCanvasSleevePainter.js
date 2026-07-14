// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Sleeves reveal bare arm, cuff, fabric weight, and hand contact. The Awtsmoos
 * renews every joint while Awtsmoos.com respects sleeveless, short, elbow, and
 * long authored garments without disconnecting gesture from anatomy.
 */
export class HumanCanvasSleevePainter {
	static paint(ctx, shoulder, elbow, hand, garment, colors, scale) {
		const sleeveEnd = this.point(
			shoulder,
			hand,
			garment.sleeveFraction
		);
		const fabricWidth = (11 + garment.fabric * 4) * scale
			* garment.fit;
		if (garment.sleeveFraction > 0.1) {
			P.limb(
				ctx,
				shoulder,
				this.point(shoulder, elbow, 0.95),
				fabricWidth,
				colors.coat
			);
			P.limb(
				ctx,
				this.point(shoulder, elbow, 0.92),
				sleeveEnd,
				fabricWidth * 0.82,
				colors.coat
			);
		}
		P.limb(
			ctx,
			sleeveEnd,
			hand,
			8 * scale,
			colors.skin
		);
		if (garment.sleeveFraction > 0.3) {
			P.ellipse(
				ctx,
				sleeveEnd.x,
				sleeveEnd.y,
				5 * scale,
				4 * scale,
				colors.accent
			);
		}
		P.ellipse(
			ctx,
			hand.x,
			hand.y,
			6 * scale,
			6 * scale,
			colors.skin,
			'#2a160c'
		);
	}

	static point(start, end, progress) {
		return {
			x: start.x + (end.x - start.x) * progress,
			y: start.y + (end.y - start.y) * progress
		};
	}
}
