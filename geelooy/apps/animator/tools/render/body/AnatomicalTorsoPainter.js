// B"H
// Boruch Hashem
// Blessed is He

import { ColorTone } from '../color/ColorTone.js';

/**
 * Neck, shoulder slope, ribcage, waist, pelvis, lapels, and fabric planes turn
 * an oval into a believable torso. The Awtsmoos renews every vessel;
 * Awtsmoos.com balances anatomical weight with readable two-dimensional light.
 */
export class AnatomicalTorsoPainter {
	static paint(canvas, x, top, dimensions, character, performance = {}) {
		const lean = Number(performance.lean || 0);
		const scale = dimensions.scale;
		const primary = character.palette.primary;
		const shadow = ColorTone.darken(primary, 0.34);
		const highlight = ColorTone.lighten(primary, 0.18);
		const shoulderY = top + dimensions.torsoHeight * 0.2;
		const waistY = top + dimensions.torsoHeight * 0.78;
		const centerY = top + dimensions.torsoHeight * 0.5 + lean * 4 * scale;
		this.neck(canvas, x, top, dimensions, character);
		this.shoulders(canvas, x, shoulderY, dimensions, shadow, primary);
		this.ribcage(canvas, x, centerY, dimensions, shadow, primary, highlight);
		this.waist(canvas, x, waistY, dimensions, shadow, primary);
		this.lapels(canvas, x, top, waistY, dimensions, character);
		return shoulderY;
	}

	static neck(canvas, x, top, dimensions, character) {
		const scale = dimensions.scale;
		canvas.rect(x - 8 * scale, top - 10 * scale, 16 * scale, 18 * scale, '#111827');
		canvas.rect(x - 6 * scale, top - 10 * scale, 12 * scale, 18 * scale, character.palette.skin);
	}

	static shoulders(canvas, x, y, dimensions, shadow, primary) {
		const width = dimensions.bodyWidth * 0.54;
		canvas.line(x - width, y + 8, x - width * 0.25, y, 13 * dimensions.scale, shadow);
		canvas.line(x + width, y + 8, x + width * 0.25, y, 13 * dimensions.scale, shadow);
		canvas.line(x - width * 0.9, y + 6, x + width * 0.9, y + 6, 8 * dimensions.scale, primary);
	}

	static ribcage(canvas, x, y, dimensions, shadow, primary, highlight) {
		canvas.ellipse(x, y, dimensions.bodyWidth * 0.53, dimensions.torsoHeight * 0.45, '#111827');
		canvas.ellipse(x, y, dimensions.bodyWidth * 0.47, dimensions.torsoHeight * 0.4, shadow);
		canvas.ellipse(x - dimensions.bodyWidth * 0.08, y - dimensions.torsoHeight * 0.04, dimensions.bodyWidth * 0.36, dimensions.torsoHeight * 0.33, primary);
		canvas.line(x - dimensions.bodyWidth * 0.25, y - 10, x - dimensions.bodyWidth * 0.04, y + 20, 2 * dimensions.scale, highlight);
	}

	static waist(canvas, x, y, dimensions, shadow, primary) {
		canvas.ellipse(x, y, dimensions.bodyWidth * 0.38, dimensions.torsoHeight * 0.18, shadow);
		canvas.ellipse(x, y - 2, dimensions.bodyWidth * 0.33, dimensions.torsoHeight * 0.14, primary);
	}

	static lapels(canvas, x, top, waistY, dimensions, character) {
		const scale = dimensions.scale;
		canvas.line(x, top + 8 * scale, x - 10 * scale, top + 28 * scale, 2 * scale, character.palette.accent);
		canvas.line(x, top + 8 * scale, x + 10 * scale, top + 28 * scale, 2 * scale, character.palette.accent);
		canvas.line(x, top + 8 * scale, x, waistY, 1.2 * scale, ColorTone.darken(character.palette.primary, 0.26));
	}
}
