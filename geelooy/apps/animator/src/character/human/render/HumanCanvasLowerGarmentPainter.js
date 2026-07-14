// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Trousers, jeans, shorts, skirts, and robes change weight and movement rather
 * than merely names. The Awtsmoos renews fabric and exposed limbs together.
 */
export class HumanCanvasLowerGarmentPainter {
	static paint(ctx, geometry, garment, colors) {
		const kind = garment.wardrobe.bottom || 'trousers';
		if (kind === 'shorts') {
			this.shorts(ctx, geometry, garment, colors);
			return;
		}
		if (['skirt', 'robe'].includes(kind)) {
			this.skirt(ctx, geometry, garment, colors, kind);
			return;
		}
		this.trousers(ctx, geometry, garment, colors.pants, kind);
	}

	static trousers(ctx, geometry, garment, color, kind) {
		const { pelvis, feet, scale } = geometry;
		const width = (kind === 'jeans' ? 14 : 13) * scale
			* garment.lowerSpread;
		const leftHip = this.hip(pelvis, garment, scale, -1);
		const rightHip = this.hip(pelvis, garment, scale, 1);
		P.limb(ctx, leftHip, feet.leftKnee, width, color);
		P.limb(ctx, feet.leftKnee, feet.left, width * 0.88, color);
		P.limb(ctx, rightHip, feet.rightKnee, width, color);
		P.limb(ctx, feet.rightKnee, feet.right, width * 0.88, color);
	}

	static shorts(ctx, geometry, garment, colors) {
		const { pelvis, feet, scale } = geometry;
		const width = 15 * scale * garment.lowerSpread;
		for (const side of [-1, 1]) {
			const knee = side < 0 ? feet.leftKnee : feet.rightKnee;
			const foot = side < 0 ? feet.left : feet.right;
			const hip = this.hip(pelvis, garment, scale, side);
			const hem = this.point(hip, knee, 0.5);
			P.limb(ctx, hip, hem, width, colors.pants);
			P.limb(ctx, hem, knee, 10 * scale, colors.skin);
			P.limb(ctx, knee, foot, 9 * scale, colors.skin);
		}
	}

	static skirt(ctx, geometry, garment, colors, kind) {
		const { pelvis, feet, scale } = geometry;
		const long = kind === 'robe';
		if (!long) {
			this.bareLegs(ctx, geometry, colors.skin);
		}
		const hemY = long
			? Math.max(feet.left.y, feet.right.y) - 7 * scale
			: pelvis.y + 52 * scale;
		const sway = (feet.left.x - feet.right.x) * garment.fabric * 0.08;
		const topHalf = garment.hip * 0.52;
		const bottomHalf = garment.hip * 0.72
			* garment.lowerSpread
			* (0.82 + garment.fabric * 0.36);
		P.polygon(ctx, [
			{ x: pelvis.x - topHalf, y: pelvis.y },
			{ x: pelvis.x + topHalf, y: pelvis.y },
			{ x: pelvis.x + bottomHalf + sway, y: hemY },
			{ x: pelvis.x - bottomHalf + sway, y: hemY }
		], colors.pants, '#111827');
		if (garment.wardrobe.lowerShape === 'pleated') {
			this.pleats(ctx, pelvis.x, pelvis.y, hemY, bottomHalf, scale);
		}
	}

	static bareLegs(ctx, geometry, skin) {
		const { pelvis, feet, scale } = geometry;
		for (const side of [-1, 1]) {
			const knee = side < 0 ? feet.leftKnee : feet.rightKnee;
			const foot = side < 0 ? feet.left : feet.right;
			const hip = { x: pelvis.x + side * 8 * scale, y: pelvis.y + 26 * scale };
			P.limb(ctx, hip, knee, 10 * scale, skin);
			P.limb(ctx, knee, foot, 9 * scale, skin);
		}
	}

	static pleats(ctx, centerX, topY, bottomY, halfWidth, scale) {
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

	static hip(pelvis, garment, scale, side) {
		return {
			x: pelvis.x + side * garment.hip * 0.2,
			y: pelvis.y + 4 * scale
		};
	}

	static point(start, end, progress) {
		return {
			x: start.x + (end.x - start.x) * progress,
			y: start.y + (end.y - start.y) * progress
		};
	}
}
