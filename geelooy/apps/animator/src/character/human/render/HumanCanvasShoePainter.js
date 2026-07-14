// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Footwear grounds weight and profession. The Awtsmoos renews sneaker, boot,
 * loafer, sandal, and heel while Awtsmoos.com keeps foot contact and color clear.
 */
export class HumanCanvasShoePainter {
	static paint(ctx, foot, garment, color, scale) {
		const profile = garment.wardrobe.shoeProfile || 'sneaker';
		if (profile === 'boot') {
			P.roundRect(
				ctx,
				foot.x - 12 * scale,
				foot.y - garment.shoeHeight,
				24 * scale,
				garment.shoeHeight + 4 * scale,
				5 * scale,
				color
			);
		}
		const width = {
			sneaker: 34,
			boot: 36,
			loafer: 31,
			sandal: 30,
			heel: 27
		}[profile] || 34;
		P.roundRect(
			ctx,
			foot.x - width * 0.48 * scale,
			foot.y - 5 * scale,
			width * scale,
			profile === 'heel' ? 8 * scale : 10 * scale,
			profile === 'loafer' ? 3 * scale : 6 * scale,
			color
		);
		if (profile === 'sandal') {
			P.limb(
				ctx,
				{ x: foot.x - 8 * scale, y: foot.y - 7 * scale },
				{ x: foot.x + 8 * scale, y: foot.y - 2 * scale },
				2 * scale,
				'#f4eadc'
			);
		}
		if (profile === 'heel') {
			P.roundRect(
				ctx,
				foot.x + 8 * scale,
				foot.y + 2 * scale,
				4 * scale,
				8 * scale,
				1 * scale,
				color
			);
		}
	}
}
