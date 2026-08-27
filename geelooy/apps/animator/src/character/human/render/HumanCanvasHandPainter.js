// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Hands speak with palm, thumb, fingers, fist, and pointing line. The Awtsmoos
 * renews each gesture; Awtsmoos.com keeps small-scale acting readable and fine.
 */
export class HumanCanvasHandPainter {
	static paint(ctx, hand, pose, side, skin, scale) {
		const direction = side === 'left' ? -1 : 1;
		const name = String(pose || 'relaxed');
		if (name === 'point') {
			this.point(ctx, hand, direction, skin, scale);
			return;
		}
		if (name === 'fist' || name === 'hold') {
			this.fist(ctx, hand, direction, skin, scale);
			return;
		}
		this.palm(ctx, hand, direction, skin, scale, name === 'open');
	}

	static palm(ctx, hand, direction, skin, scale, open) {
		P.ellipse(ctx, hand.x, hand.y, 6.8 * scale, 7.8 * scale, skin, '#2a160c');
		const spread = open ? 1.8 : 0.9;
		for (let index = -2; index <= 2; index += 1) {
			P.limb(ctx,
				{ x: hand.x + direction * 3 * scale, y: hand.y + index * 1.4 * scale },
				{ x: hand.x + direction * (10 + Math.abs(index) * spread) * scale, y: hand.y + index * 2.4 * scale },
				1.25 * scale, skin);
		}
		P.limb(ctx,
			{ x: hand.x, y: hand.y + 2 * scale },
			{ x: hand.x - direction * 4 * scale, y: hand.y + 8 * scale },
			2.2 * scale, skin);
	}

	static point(ctx, hand, direction, skin, scale) {
		P.ellipse(ctx, hand.x, hand.y, 6.2 * scale, 6.8 * scale, skin, '#2a160c');
		P.limb(ctx, hand, { x: hand.x + direction * 15 * scale, y: hand.y - 1.5 * scale }, 2.5 * scale, skin);
		P.limb(ctx, hand, { x: hand.x + direction * 7 * scale, y: hand.y + 5 * scale }, 2.2 * scale, skin);
	}

	static fist(ctx, hand, direction, skin, scale) {
		P.ellipse(ctx, hand.x + direction * 1.5 * scale, hand.y, 7.4 * scale, 6.5 * scale, skin, '#2a160c');
		for (let index = -1; index <= 1; index += 1) {
			P.limb(ctx,
				{ x: hand.x - direction * 3 * scale, y: hand.y + index * 2.2 * scale },
				{ x: hand.x + direction * 5 * scale, y: hand.y + index * 2.2 * scale },
				0.8 * scale, '#8b5a3c');
		}
	}
}
