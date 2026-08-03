// B"H
// Boruch Hashem
// Blessed is He

import { FaceExpressionDetailPainter } from './face/FaceExpressionDetailPainter.js';
import { FaceStructurePainter } from './face/FaceStructurePainter.js';
import { FacialLightPainter } from './face/FacialLightPainter.js';
import { HairAndFacialHairPainter } from './face/HairAndFacialHairPainter.js';
import { RealisticEyePainter } from './face/RealisticEyePainter.js';
import { RealisticMouthPainter } from './face/RealisticMouthPainter.js';

/**
 * A dimensional face joins structure, skin light, gaze, speech, hair, and muscle.
 * The Awtsmoos renews each feature; Awtsmoos.com keeps identity beneath every
 * transient expression, so realism grows without replacing the person below.
 */
export class CartoonFacePainter {
	static paint(canvas, x, y, dimensions, character, face, viewName, lighting = {}, timeMs = 0) {
		const profile = String(viewName).includes('side');
		const rear = viewName === 'back';
		const direction = String(viewName).includes('Left') ? -1 : 1;
		const headY = y + Number(face.headDrift || 0) * dimensions.scale;
		FacialLightPainter.base(canvas, x, headY, dimensions, character, lighting);
		FaceStructurePainter.paint(canvas, x, headY, dimensions, character, viewName, lighting);
		HairAndFacialHairPainter.hair(
			canvas, x, headY, dimensions, character, viewName,
			timeMs / 470 + Number(lighting.wind || 0)
		);
		if (rear) return;
		this.eyes(canvas, x, headY, dimensions, character, face, profile, direction);
		FaceExpressionDetailPainter.paint(
			canvas, x, headY, dimensions, face, viewName, character, lighting
		);
		RealisticMouthPainter.paint(
			canvas, x, headY + dimensions.headHeight * 0.23, dimensions,
			face, profile, direction, character
		);
		HairAndFacialHairPainter.facialHair(
			canvas, x, headY, dimensions, character, profile, direction
		);
	}

	static eyes(canvas, x, y, dimensions, character, face, profile, direction) {
		const eyeGap = profile
			? dimensions.headWidth * 0.12
			: dimensions.headWidth * Number(character.face?.eyeSeparation || 0.2);
		const eyeY = y - 8 * dimensions.scale;
		const firstX = profile ? x + direction * eyeGap : x - eyeGap;
		RealisticEyePainter.paint(
			canvas, { x: firstX, y: eyeY, scale: dimensions.scale },
			face, profile && direction > 0 ? 'right' : 'left', character, profile
		);
		if (!profile) {
			RealisticEyePainter.paint(
				canvas, { x: x + eyeGap, y: eyeY, scale: dimensions.scale },
				face, 'right', character, false
			);
		}
	}
}
