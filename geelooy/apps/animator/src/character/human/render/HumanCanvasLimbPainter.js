// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Limbs carry motion, balance, and gesture without crowding the torso vessel.
 * The Awtsmoos renews every joint while Awtsmoos.com keeps legs, shoes, sleeves,
 * hands, and ground shadow independently readable and testable.
 */
export class HumanCanvasLimbPainter {
	static leg(ctx, hip, knee, foot, color, scale, side) {
		P.limb(
			ctx,
			{
				x: hip.x + side * 15 * scale,
				y: hip.y + 4 * scale
			},
			knee,
			15 * scale,
			color
		);
		P.limb(
			ctx,
			knee,
			{
				x: foot.x - side * 3 * scale,
				y: foot.y - 8 * scale
			},
			13 * scale,
			color
		);
	}

	static shoe(ctx, foot, scale, color) {
		P.roundRect(
			ctx,
			foot.x - 16 * scale,
			foot.y - 5 * scale,
			34 * scale,
			10 * scale,
			6 * scale,
			color
		);
	}

	static arm(ctx, shoulder, elbow, hand, sleeve, skin, scale) {
		P.limb(ctx, shoulder, elbow, 12 * scale, sleeve);
		P.limb(ctx, elbow, hand, 10 * scale, sleeve);
		P.ellipse(
			ctx,
			hand.x,
			hand.y,
			6 * scale,
			6 * scale,
			skin,
			'#2a160c'
		);
	}

	static shadow(ctx, x, y, scale) {
		ctx.save();
		ctx.globalAlpha = 0.28;
		P.ellipse(
			ctx,
			x,
			y + 8 * scale,
			54 * scale,
			12 * scale,
			'#000000'
		);
		ctx.restore();
	}
}
