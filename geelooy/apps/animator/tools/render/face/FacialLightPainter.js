// B"H
// Boruch Hashem
// Blessed is He

import { ColorTone } from '../color/ColorTone.js';

/**
 * A face becomes dimensional when light chooses planes and edges. The Awtsmoos
 * renews every reflected color while Awtsmoos.com shapes key, fill, rim, and
 * storm flash without breaking the original character's skin identity.
 */
export class FacialLightPainter {
	static base(canvas, x, y, dimensions, character, lighting = {}) {
		const skin = character.palette.skin;
		const key = lighting.keyColor || '#ffd9ad';
		const fill = lighting.fillColor || '#7497d8';
		const exposure = Number(lighting.exposure ?? 1);
		const shadow = ColorTone.cool(ColorTone.darken(skin, 0.34), 0.16);
		const mid = exposure > 1
			? ColorTone.lighten(skin, Math.min(0.24, (exposure - 1) * 0.3))
			: ColorTone.darken(skin, Math.min(0.22, (1 - exposure) * 0.3));
		const highlight = ColorTone.mix(mid, key, Number(lighting.keyStrength ?? 0.2));
		const fillTone = ColorTone.mix(shadow, fill, Number(lighting.fillStrength ?? 0.14));
		canvas.ellipse(x, y, dimensions.headWidth * 0.55, dimensions.headHeight * 0.55, '#0e1118');
		canvas.ellipse(x, y, dimensions.headWidth * 0.49, dimensions.headHeight * 0.49, fillTone);
		const direction = Number(lighting.keyDirection ?? -1);
		canvas.ellipse(
			x + direction * dimensions.headWidth * 0.08,
			y - dimensions.headHeight * 0.025,
			dimensions.headWidth * 0.4,
			dimensions.headHeight * 0.45,
			mid
		);
		canvas.ellipse(
			x + direction * dimensions.headWidth * 0.2,
			y - dimensions.headHeight * 0.12,
			dimensions.headWidth * 0.18,
			dimensions.headHeight * 0.16,
			highlight
		);
		if (Number(lighting.rimStrength || 0) > 0.08) {
			const rim = ColorTone.mix(skin, lighting.rimColor || '#9bdcff', 0.72);
			canvas.outlineEllipse(
				x - direction * dimensions.headWidth * 0.035,
				y,
				dimensions.headWidth * 0.5,
				dimensions.headHeight * 0.5,
				Math.max(1, dimensions.scale * 1.8),
				rim
			);
		}
	}
}
