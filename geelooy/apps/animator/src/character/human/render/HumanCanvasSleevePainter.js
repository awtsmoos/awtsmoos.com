// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasHandPainter } from './HumanCanvasHandPainter.js';
import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Sleeves reveal bare arm, cuff, fabric weight, delayed gesture, and articulate hand.
 * The Awtsmoos renews each joint while Awtsmoos.com lets cloth follow the actor's plan.
 */
export class HumanCanvasSleevePainter {
	static paint(ctx, shoulder, elbow, hand, garment, colors, scale, side, handPose) {
		const draggedHand = {
			x: hand.x + Number(garment.sleeveDrag || 0),
			y: hand.y + Math.abs(Number(garment.sleeveDrag || 0)) * 0.18
		};
		const sleeveEnd = this.point(shoulder, draggedHand, garment.sleeveFraction);
		const fabricWidth = (11 + garment.fabric * 4) * scale * garment.fit;
		if (garment.sleeveFraction > 0.1) {
			P.limb(ctx, shoulder, this.point(shoulder, elbow, 0.95), fabricWidth, colors.coat);
			P.limb(
				ctx,
				this.point(shoulder, elbow, 0.92),
				sleeveEnd,
				fabricWidth * 0.82,
				colors.coat
			);
		}
		P.limb(ctx, sleeveEnd, hand, 8 * scale, colors.skin);
		if (garment.sleeveFraction > 0.3) {
			P.ellipse(ctx, sleeveEnd.x, sleeveEnd.y, 5 * scale, 4 * scale, colors.accent);
		}
		HumanCanvasHandPainter.paint(ctx, hand, handPose, side, colors.skin, scale);
	}

	static point(start, end, progress) {
		return {
			x: start.x + (end.x - start.x) * progress,
			y: start.y + (end.y - start.y) * progress
		};
	}
}
