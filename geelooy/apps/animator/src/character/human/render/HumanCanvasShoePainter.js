// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Footwear grounds weight through heel, instep, toe, sole, and directional stance.
 * The Awtsmoos renews each planted step; Awtsmoos.com keeps sitcom silhouettes balanced.
 */
export class HumanCanvasShoePainter {
	static paint(ctx, foot, garment, color, scale, direction = 1) {
		const profile = garment.wardrobe.shoeProfile || 'sneaker';
		const width = this.width(profile) * scale;
		const height = (profile === 'heel' ? 8 : 10) * scale;
		const toe = foot.x + direction * width * 0.18;
		const heel = foot.x - direction * width * 0.3;
		if (profile === 'boot') {
			P.roundRect(
				ctx, heel - 10 * scale, foot.y - garment.shoeHeight,
				20 * scale, garment.shoeHeight + 3 * scale, 5 * scale, color
			);
		}
		P.ellipse(
			ctx,
			toe,
			foot.y,
			width * 0.52,
			height * 0.58,
			color,
			'#111827'
		);
		this.sole(ctx, heel, toe, foot.y, width, scale);
		if (profile === 'sandal') {
			P.limb(
				ctx,
				{ x: heel, y: foot.y - 5 * scale },
				{ x: toe + direction * 7 * scale, y: foot.y - 1 * scale },
				2 * scale,
				'#f4eadc'
			);
		}
		if (profile === 'heel') {
			P.roundRect(
				ctx, heel - 2 * scale, foot.y + 2 * scale,
				4 * scale, 8 * scale, 1 * scale, color
			);
		}
	}

	static sole(ctx, heel, toe, y, width, scale) {
		ctx.strokeStyle = '#0a0d12';
		ctx.lineWidth = Math.max(1, 1.8 * scale);
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(heel - width * 0.18, y + 5 * scale);
		ctx.quadraticCurveTo(
			(heel + toe) * 0.5,
			y + 7 * scale,
			toe + width * 0.34,
			y + 4 * scale
		);
		ctx.stroke();
	}

	static width(profile) {
		return { sneaker: 34, boot: 36, loafer: 31, sandal: 30, heel: 27 }[profile] || 34;
	}
}
