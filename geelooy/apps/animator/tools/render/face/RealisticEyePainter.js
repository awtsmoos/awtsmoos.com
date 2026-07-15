// B"H
// Boruch Hashem
// Blessed is He

import { ColorTone } from '../color/ColorTone.js';

/**
 * Attention lives in the eye before dialogue explains it. The Awtsmoos renews
 * lid weight, iris depth, pupil response, moisture, and highlights while
 * Awtsmoos.com turns each eye into a distinct acting instrument.
 */
export class RealisticEyePainter {
	static paint(canvas, placement, face, side, character, profile = false) {
		const direction = side === 'left' ? -1 : 1;
		const scale = placement.scale;
		const lidOpen = side === 'left'
			? face.eyes.leftLidOpen
			: face.eyes.rightLidOpen;
		const width = 8.8 * scale * (profile ? 0.72 : 1);
		const height = Math.max(1.1, 9.2 * scale * lidOpen);
		const x = placement.x;
		const y = placement.y;
		const outline = ColorTone.darken(character.palette.brow, 0.45);
		canvas.ellipse(x, y, width + 1.8 * scale, height + 1.6 * scale, outline);
		canvas.ellipse(x, y, width, height, '#f7f4ee');
		if (height <= 1.8 * scale) {
			canvas.line(x - width, y, x + width, y, 1.6 * scale, outline);
			return;
		}
		const gazeDirection = profile ? direction : 1;
		const irisX = x + face.eyes.gazeX * width * 0.42 * gazeDirection;
		const irisY = y + face.eyes.gazeY * height * 0.34;
		const irisRadius = Math.max(2, 3.9 * scale);
		const iris = character.face?.irisColor || '#315b78';
		canvas.circle(irisX, irisY, irisRadius + 1.1 * scale, ColorTone.darken(iris, 0.42));
		canvas.circle(irisX, irisY, irisRadius, iris);
		const pupil = irisRadius * (0.34 + face.eyes.pupilDilation * 0.42);
		canvas.circle(irisX, irisY, pupil, '#06080d');
		canvas.circle(irisX - 1.2 * scale, irisY - 1.4 * scale, 1.1 * scale, '#ffffff');
		if (face.eyes.tearShine > 0.2) {
			canvas.circle(x + direction * width * 0.72, y + height * 0.68, 1.1 * scale, '#bfe7ff');
		}
		this.lashes(canvas, x, y, width, height, scale, direction, face, character);
	}

	static lashes(canvas, x, y, width, height, scale, direction, face, character) {
		const count = Math.min(5, Number(face.eyes.lashes?.count || character.face?.lashCount || 0));
		if (!count) return;
		const color = character.palette.brow;
		for (let index = 0; index < count; index += 1) {
			const ratio = count === 1 ? 0.5 : index / (count - 1);
			const lashX = x + direction * (width * (0.25 + ratio * 0.65));
			const lashY = y - height * (0.72 + ratio * 0.15);
			canvas.line(lashX, lashY, lashX + direction * 2.4 * scale, lashY - 3.5 * scale, 1.1 * scale, color);
		}
	}
}
