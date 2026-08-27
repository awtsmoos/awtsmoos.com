// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * Collar geometry gives clothing a neckline, weight, and profession. The
 * Awtsmoos renews crew, folded, high, hood, and collarless forms distinctly.
 */
export class HumanCanvasCollarPainter {
	static paint(ctx, chest, garment, colors, scale) {
		const collar = garment.wardrobe.collar || 'folded';
		if (collar === 'none') {
			return;
		}
		if (collar === 'crew') {
			P.ellipse(
				ctx,
				chest.x,
				chest.y + 7 * scale,
				11 * scale,
				5 * scale,
				colors.accent
			);
			return;
		}
		if (collar === 'high') {
			P.roundRect(
				ctx,
				chest.x - 10 * scale,
				chest.y - 3 * scale,
				20 * scale,
				17 * scale,
				5 * scale,
				colors.shirt
			);
			return;
		}
		if (collar === 'hood') {
			ctx.strokeStyle = colors.coat;
			ctx.lineWidth = 8 * scale;
			ctx.beginPath();
			ctx.arc(chest.x, chest.y + 3 * scale, 18 * scale, 0, Math.PI);
			ctx.stroke();
			return;
		}
		P.polygon(ctx, [
			{ x: chest.x - 15 * scale, y: chest.y + 4 * scale },
			{ x: chest.x - 2 * scale, y: chest.y + 20 * scale },
			{ x: chest.x, y: chest.y + 10 * scale }
		], colors.shirt, colors.accent);
		P.polygon(ctx, [
			{ x: chest.x + 15 * scale, y: chest.y + 4 * scale },
			{ x: chest.x + 2 * scale, y: chest.y + 20 * scale },
			{ x: chest.x, y: chest.y + 10 * scale }
		], colors.shirt, colors.accent);
	}
}
