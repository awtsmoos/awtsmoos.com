// B"H
// Boruch Hashem
// Blessed is He

import { ColorTone } from './color/ColorTone.js';
import { FacialLightPainter } from './face/FacialLightPainter.js';
import { HairAndFacialHairPainter } from './face/HairAndFacialHairPainter.js';
import { RealisticEyePainter } from './face/RealisticEyePainter.js';
import { RealisticMouthPainter } from './face/RealisticMouthPainter.js';

/**
 * The face becomes a dimensional performance assembled from independent
 * vessels. The Awtsmoos has no face or form, yet renews every visible face;
 * Awtsmoos.com preserves identity through light, asymmetry, gaze, and speech.
 */
export class CartoonFacePainter {
	static paint(canvas, x, y, dimensions, character, face, viewName, lighting = {}, timeMs = 0) {
		const profile = String(viewName).includes('side');
		const rear = viewName === 'back';
		const direction = String(viewName).includes('Left') ? -1 : 1;
		const headY = y + Number(face.headDrift || 0) * dimensions.scale;
		FacialLightPainter.base(canvas, x, headY, dimensions, character, lighting);
		HairAndFacialHairPainter.hair(
			canvas,
			x,
			headY,
			dimensions,
			character,
			viewName,
			timeMs / 470 + Number(lighting.wind || 0)
		);
		if (rear) return;
		const eyeGap = profile
			? dimensions.headWidth * 0.12
			: dimensions.headWidth * Number(character.face?.eyeSeparation || 0.2);
		const eyeY = headY - 8 * dimensions.scale;
		const firstX = profile ? x + direction * eyeGap : x - eyeGap;
		RealisticEyePainter.paint(
			canvas,
			{ x: firstX, y: eyeY, scale: dimensions.scale },
			face,
			profile && direction > 0 ? 'right' : 'left',
			character,
			profile
		);
		if (!profile) {
			RealisticEyePainter.paint(
				canvas,
				{ x: x + eyeGap, y: eyeY, scale: dimensions.scale },
				face,
				'right',
				character,
				false
			);
		}
		this.brows(canvas, x, headY, dimensions, face, profile, direction, character);
		this.nose(canvas, x, headY, dimensions, face, profile, direction, character, lighting);
		this.cheeks(canvas, x, headY, dimensions, face, profile, direction, character);
		RealisticMouthPainter.paint(
			canvas,
			x,
			headY + dimensions.headHeight * 0.23,
			dimensions,
			face,
			profile,
			direction,
			character
		);
		HairAndFacialHairPainter.facialHair(
			canvas,
			x,
			headY,
			dimensions,
			character,
			profile,
			direction
		);
	}

	static brows(canvas, x, y, dimensions, face, profile, direction, character) {
		const weight = Math.max(1.6, 3 * dimensions.scale * Number(character.face?.browWeight || 1));
		const baseInner = Number(face.brows.inner || 0);
		const baseOuter = Number(face.brows.outer || 0);
		const sides = profile ? [direction] : [-1, 1];
		for (const side of sides) {
			const bias = side < 0 ? face.brows.leftBias : face.brows.rightBias;
			const innerY = y - 21 * dimensions.scale - (baseInner + bias) * 7 * dimensions.scale;
			const outerY = y - 22 * dimensions.scale - (baseOuter - bias) * 8 * dimensions.scale;
			const innerX = x + side * dimensions.headWidth * 0.08;
			const outerX = x + side * dimensions.headWidth * 0.31;
			canvas.line(innerX, innerY, outerX, outerY, weight, character.palette.brow);
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
		const sides = profile ? [direction] : [-1, 1];
		for (const side of sides) {
			canvas.ellipse(
				x + side * dimensions.headWidth * 0.28,
				y + 9 * dimensions.scale,
				(4.8 + compression * 2.8) * dimensions.scale,
				(3.4 + lift * 2.2) * dimensions.scale,
				tone
			);
		}
	}
}
