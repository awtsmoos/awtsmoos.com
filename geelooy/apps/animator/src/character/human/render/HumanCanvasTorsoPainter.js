// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasCollarPainter } from './HumanCanvasCollarPainter.js';
import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Torso clothing reveals body, fit, fabric weight, collar, and coat length. The
 * Awtsmoos renews breath and drape while Awtsmoos.com avoids one universal oval.
 */
export class HumanCanvasTorsoPainter {
	static paint(ctx, geometry, garment, colors) {
		const { chest, pelvis, motion, profile, scale } = geometry;
		const outerwear = garment.wardrobe.outerwear || 'jacket';
		const bottom = pelvis.y + 42 * scale * garment.hemLength;
		const chestDepth = Number(profile.chestDepth || 1);
		const shoulderHalf = garment.shoulder * 0.5;
		const waistHalf = garment.waist * 0.56;
		const hipHalf = (garment.hip + garment.flare) * 0.5;
		ctx.fillStyle = colors.coat;
		ctx.strokeStyle = '#111827';
		ctx.lineWidth = 2 * scale;
		ctx.beginPath();
		ctx.moveTo(chest.x - shoulderHalf, chest.y + 6 * scale);
		ctx.quadraticCurveTo(
			chest.x - waistHalf,
			chest.y + 46 * scale,
			chest.x - hipHalf,
			bottom
		);
		ctx.lineTo(chest.x + hipHalf, bottom);
		ctx.quadraticCurveTo(
			chest.x + waistHalf,
			chest.y + 46 * scale,
			chest.x + shoulderHalf,
			chest.y + 6 * scale
		);
		ctx.quadraticCurveTo(
			chest.x,
			chest.y - 10 * scale * chestDepth + motion.breath,
			chest.x - shoulderHalf,
			chest.y + 6 * scale
		);
		ctx.fill();
		ctx.stroke();
		this.top(ctx, chest, pelvis, garment, colors, scale);
		if (outerwear !== 'none') {
			this.placket(ctx, chest, bottom, colors, scale, garment.fabric);
		}
		HumanCanvasCollarPainter.paint(
			ctx,
			chest,
			garment,
			colors,
			scale
		);
	}

	static top(ctx, chest, pelvis, garment, colors, scale) {
		const width = 28 * scale * Math.min(1.25, garment.fit);
		P.roundRect(
			ctx,
			chest.x - width * 0.5,
			chest.y + 12 * scale,
			width,
			Math.max(26 * scale, pelvis.y - chest.y - 8 * scale),
			5 * scale,
			colors.shirt
		);
	}

	static placket(ctx, chest, bottom, colors, scale, fabric) {
		P.roundRect(
			ctx,
			chest.x - 2 * scale,
			chest.y + 18 * scale,
			4 * scale,
			Math.max(20 * scale, bottom - chest.y - 28 * scale),
			2 * scale,
			colors.accent
		);
		if (fabric > 0.6) {
			P.ellipse(
				ctx,
				chest.x,
				bottom - 6 * scale,
				4 * scale,
				4 * scale,
				colors.accent
			);
		}
	}
}
