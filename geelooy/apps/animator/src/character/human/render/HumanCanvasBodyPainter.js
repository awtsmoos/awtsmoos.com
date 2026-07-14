// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasGarmentResolver } from './HumanCanvasGarmentResolver.js';
import { HumanCanvasLimbPainter } from './HumanCanvasLimbPainter.js';
import { HumanCanvasLowerGarmentPainter } from './HumanCanvasLowerGarmentPainter.js';
import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';
import { HumanCanvasShoePainter } from './HumanCanvasShoePainter.js';
import { HumanCanvasSleevePainter } from './HumanCanvasSleevePainter.js';
import { HumanCanvasTorsoPainter } from './HumanCanvasTorsoPainter.js';

/**
 * The whole body coordinates anatomy, garment silhouette, exposed skin, sleeves,
 * shoes, collar, breath, gesture, and contact shadow as one living performance.
 */
export class HumanCanvasBodyPainter {
	static paint(ctx, geometry, character, colors) {
		const garment = HumanCanvasGarmentResolver.resolve(
			character,
			geometry.profile,
			geometry.scale
		);
		HumanCanvasLimbPainter.shadow(
			ctx,
			geometry.x,
			geometry.footY,
			geometry.scale
		);
		HumanCanvasLowerGarmentPainter.paint(
			ctx,
			geometry,
			garment,
			colors
		);
		HumanCanvasShoePainter.paint(
			ctx,
			geometry.feet.left,
			garment,
			colors.shoe,
			geometry.scale
		);
		HumanCanvasShoePainter.paint(
			ctx,
			geometry.feet.right,
			garment,
			colors.shoe,
			geometry.scale
		);
		this.arm(
			ctx,
			geometry,
			garment,
			colors,
			'left'
		);
		this.arm(
			ctx,
			geometry,
			garment,
			colors,
			'right'
		);
		HumanCanvasTorsoPainter.paint(
			ctx,
			geometry,
			garment,
			colors
		);
		P.roundRect(
			ctx,
			geometry.neck.x - 9 * geometry.scale,
			geometry.neck.y - 4 * geometry.scale,
			18 * geometry.scale,
			23 * geometry.scale,
			8 * geometry.scale,
			colors.skin
		);
	}

	static arm(ctx, geometry, garment, colors, side) {
		HumanCanvasSleevePainter.paint(
			ctx,
			geometry.shoulders[side],
			geometry.arms[`${side}Elbow`],
			geometry.arms[`${side}Hand`],
			garment,
			colors,
			geometry.scale
		);
	}
}
