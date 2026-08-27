// B"H
// Boruch Hashem
// Blessed is He

import { ColorTone } from '../color/ColorTone.js';

/**
 * Speech is shaped by pressure, breath, emotion, and asymmetry. The Awtsmoos
 * renews every syllable while Awtsmoos.com keeps viseme opening separate from
 * lip compression, jaw tension, smile, frown, and restrained hesitation.
 */
export class RealisticMouthPainter {
	static paint(canvas, x, y, dimensions, face, profile, direction, character) {
		const scale = dimensions.scale;
		const mouth = face.mouth;
		const profileFactor = profile ? 0.62 : 1;
		const width = Math.max(5, 25 * scale * Number(mouth.width || 0.7) * profileFactor);
		const open = Math.max(0.8, 16 * scale * Number(mouth.jawOpen || mouth.open || 0));
		const press = Number(mouth.lipPress || 0);
		const skew = Number(mouth.skew || 0) * width;
		const mouthX = profile ? x + direction * dimensions.headWidth * 0.36 : x + skew;
		const mouthY = y + Number(mouth.frown || 0) * 3.5 - Number(mouth.smile || 0) * 2.8;
		const lip = character.face?.lipColor || ColorTone.warm(character.palette.skin, 0.22);
		const shadow = ColorTone.darken(lip, 0.62);
		const visibleOpen = open * (1 - press * 0.82);
		if (visibleOpen < 2.2 * scale) {
			canvas.line(mouthX - width, mouthY, mouthX + width, mouthY + skew * 0.08, 2.2 * scale, shadow);
			canvas.line(mouthX - width * 0.72, mouthY - 1.1 * scale, mouthX + width * 0.62, mouthY - 0.4 * scale, 1.2 * scale, lip);
			return;
		}
		canvas.ellipse(mouthX, mouthY, width + 1.4 * scale, visibleOpen + 1.2 * scale, shadow);
		canvas.ellipse(mouthX, mouthY, width, visibleOpen, '#3a0d18');
		this.teeth(canvas, mouthX, mouthY, width, visibleOpen, scale, mouth);
		this.tongue(canvas, mouthX, mouthY, width, visibleOpen, scale);
		canvas.line(mouthX - width * 0.82, mouthY - visibleOpen * 0.78, mouthX + width * 0.82, mouthY - visibleOpen * 0.7, 1.6 * scale, lip);
		canvas.line(mouthX - width * 0.76, mouthY + visibleOpen * 0.76, mouthX + width * 0.76, mouthY + visibleOpen * 0.68, 1.8 * scale, ColorTone.darken(lip, 0.16));
	}

	static teeth(canvas, x, y, width, height, scale, mouth) {
		if (height < 4 * scale || Number(mouth.jawTension || 0) > 0.82) return;
		canvas.rect(x - width * 0.68, y - height * 0.62, width * 1.36, Math.max(1.5, height * 0.28), '#f7f4e8');
		if (Number(mouth.jawTension || 0) > 0.45) {
			for (let index = -2; index <= 2; index += 1) {
				const toothX = x + index * width * 0.24;
				canvas.line(toothX, y - height * 0.6, toothX, y - height * 0.34, 0.7 * scale, '#b8b7af');
			}
		}
	}

	static tongue(canvas, x, y, width, height, scale) {
		if (height < 6 * scale) return;
		canvas.ellipse(x, y + height * 0.48, width * 0.48, height * 0.26, '#b94b62');
		canvas.line(x, y + height * 0.34, x, y + height * 0.58, 0.8 * scale, '#7f263b');
	}
}
