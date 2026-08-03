// B"H
// Boruch Hashem
// Blessed is He

import { ColorTone } from '../color/ColorTone.js';

/**
 * Brows, nose, and cheek pressure become readable muscle consequences. The
 * Awtsmoos renews each subtle change; Awtsmoos.com keeps emotional light
 * distinct from neutral identity, so the same face may doubt, delight, or fight.
 */
export class FaceExpressionDetailPainter {
	static paint(canvas, x, y, dimensions, face, viewName, character, lighting) {
		const profile = String(viewName).includes('side');
		const direction = String(viewName).includes('Left') ? -1 : 1;
		this.brows(canvas, x, y, dimensions, face, profile, direction, character);
		this.nose(canvas, x, y, dimensions, face, profile, direction, character, lighting);
		this.cheeks(canvas, x, y, dimensions, face, profile, direction, character);
	}

	static brows(canvas, x, y, dimensions, face, profile, direction, character) {
		const weight = Math.max(1.4, 3 * dimensions.scale * Number(character.face?.browWeight || 1));
		const sides = profile ? [direction] : [-1, 1];
		for (const side of sides) {
			const bias = side < 0 ? face.brows.leftBias : face.brows.rightBias;
			const innerY = y - 21 * dimensions.scale - (Number(face.brows.inner || 0) + bias) * 7 * dimensions.scale;
			const outerY = y - 22 * dimensions.scale - (Number(face.brows.outer || 0) - bias) * 8 * dimensions.scale;
			canvas.line(
				x + side * dimensions.headWidth * 0.08, innerY,
				x + side * dimensions.headWidth * 0.31, outerY,
				weight, character.palette.brow
			);
		}
	}

	static nose(canvas, x, y, dimensions, face, profile, direction, character, lighting) {
		const noseX = profile ? x + direction * dimensions.headWidth * 0.31 : x;
		const noseY = y + dimensions.headHeight * 0.07;
		const shadow = ColorTone.darken(character.palette.skin, 0.32);
		const flare = Number(face.nostrilFlare || 0);
		canvas.line(noseX, noseY - 7 * dimensions.scale, noseX + direction * 2 * dimensions.scale, noseY + 5 * dimensions.scale, 1.3 * dimensions.scale, shadow);
		canvas.ellipse(noseX + direction * 2.2 * dimensions.scale, noseY + 6 * dimensions.scale, (2.4 + flare * 2.2) * dimensions.scale, 1.5 * dimensions.scale, shadow);
		if (Number(face.noseWrinkle || 0) > 0.22) {
			canvas.line(noseX - 5 * dimensions.scale, noseY - 5 * dimensions.scale, noseX + 5 * dimensions.scale, noseY - 3 * dimensions.scale, 1.1 * dimensions.scale, lighting.rimColor || shadow);
		}
	}

	static cheeks(canvas, x, y, dimensions, face, profile, direction, character) {
		const lift = Number(face.cheekLift || face.cheeks?.lift || face.mouth?.smile || 0);
		const compression = Number(face.cheekCompression || 0);
		if (lift + compression < 0.12) return;
		const tone = ColorTone.warm(character.palette.skin, 0.28 + lift * 0.16);
		for (const side of profile ? [direction] : [-1, 1]) {
			canvas.ellipse(
				x + side * dimensions.headWidth * 0.28, y + 9 * dimensions.scale,
				(4.8 + compression * 2.8) * dimensions.scale,
				(3.4 + lift * 2.2) * dimensions.scale, tone
			);
		}
	}
}
