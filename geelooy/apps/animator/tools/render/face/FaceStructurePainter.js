// B"H
// Boruch Hashem
// Blessed is He

import { ColorTone } from '../color/ColorTone.js';

/**
 * Bone, ear, jaw, chin, philtrum, and neck-shadow give the face a human vessel.
 * The Awtsmoos renews every plane; Awtsmoos.com lets identity remain steady
 * while angle, light, and expression reveal different surfaces in measured flight.
 */
export class FaceStructurePainter {
	static paint(canvas, x, y, dimensions, character, viewName, lighting = {}) {
		const profile = String(viewName).includes('side');
		const direction = String(viewName).includes('Left') ? -1 : 1;
		const scale = dimensions.scale;
		const skin = character.palette.skin;
		const shadow = ColorTone.darken(skin, 0.28);
		const rim = lighting.rimColor || ColorTone.lighten(skin, 0.18);
		this.ears(canvas, x, y, dimensions, skin, shadow, profile, direction);
		this.jaw(canvas, x, y, dimensions, shadow, profile, direction);
		this.chin(canvas, x, y, dimensions, shadow, profile, direction);
		this.philtrum(canvas, x, y, scale, shadow, profile, direction);
		this.neckShadow(canvas, x, y, dimensions, shadow, rim);
	}

	static ears(canvas, x, y, dimensions, skin, shadow, profile, direction) {
		const sides = profile ? [direction] : [-1, 1];
		for (const side of sides) {
			const earX = x + side * dimensions.headWidth * 0.48;
			canvas.ellipse(earX, y + dimensions.headHeight * 0.03, 5.8 * dimensions.scale, 10.5 * dimensions.scale, shadow);
			canvas.ellipse(earX - side * dimensions.scale, y + dimensions.headHeight * 0.02, 4.2 * dimensions.scale, 8.2 * dimensions.scale, skin);
			canvas.line(earX, y - 2 * dimensions.scale, earX - side * 2.4 * dimensions.scale, y + 5 * dimensions.scale, 1.1 * dimensions.scale, shadow);
		}
	}

	static jaw(canvas, x, y, dimensions, color, profile, direction) {
		const width = dimensions.headWidth * 0.4;
		const jawY = y + dimensions.headHeight * 0.37;
		if (profile) {
			canvas.line(x + direction * width, y + 8, x + direction * width * 0.48, jawY, 1.4 * dimensions.scale, color);
			return;
		}
		canvas.line(x - width, y + 9, x - width * 0.48, jawY, 1.2 * dimensions.scale, color);
		canvas.line(x + width, y + 9, x + width * 0.48, jawY, 1.2 * dimensions.scale, color);
	}

	static chin(canvas, x, y, dimensions, color, profile, direction) {
		const chinX = profile ? x + direction * dimensions.headWidth * 0.22 : x;
		const chinY = y + dimensions.headHeight * 0.42;
		canvas.line(chinX - 5 * dimensions.scale, chinY, chinX + 5 * dimensions.scale, chinY, 1.2 * dimensions.scale, color);
	}

	static philtrum(canvas, x, y, scale, color, profile, direction) {
		const centerX = profile ? x + direction * 9 * scale : x;
		canvas.line(centerX, y + 8 * scale, centerX, y + 14 * scale, 0.9 * scale, color);
	}

	static neckShadow(canvas, x, y, dimensions, shadow, rim) {
		const neckY = y + dimensions.headHeight * 0.54;
		canvas.rect(x - 8 * dimensions.scale, neckY, 16 * dimensions.scale, 8 * dimensions.scale, shadow);
		canvas.line(x - 7 * dimensions.scale, neckY, x - 3 * dimensions.scale, neckY + 8 * dimensions.scale, 1.2 * dimensions.scale, rim);
	}
}
