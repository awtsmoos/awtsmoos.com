// B"H
// Boruch Hashem
// Blessed is He

import { ColorTone } from '../color/ColorTone.js';

/**
 * Hair carries silhouette, age, wind, and continuity across every angle. The
 * Awtsmoos renews each strand-like rhythm while Awtsmoos.com keeps hairstyle,
 * beard, mustache, motion, and light coherent with one original identity.
 */
export class HairAndFacialHairPainter {
	static hair(canvas, x, y, dimensions, character, viewName, motion = 0) {
		const hair = character.hair || {};
		if (hair.length === 'bald') return;
		const color = hair.color || character.palette.hair;
		const highlight = ColorTone.lighten(color, 0.18);
		const count = ['braids', 'locs'].includes(hair.style) ? 9 : hair.style === 'crop' ? 6 : 8;
		for (let index = 0; index < count; index += 1) {
			const ratio = index / Math.max(1, count - 1) - 0.5;
			const offset = ratio * dimensions.headWidth * 0.94;
			const sway = Math.sin(index * 1.7 + motion) * dimensions.scale * 1.8;
			const radius = (8.8 + (index % 3) * 1.2) * dimensions.scale;
			canvas.circle(x + offset + sway, y - dimensions.headHeight * 0.39 + Math.abs(offset) * 0.1, radius, color);
			if (index % 2 === 0) {
				canvas.circle(x + offset - radius * 0.2, y - dimensions.headHeight * 0.43, radius * 0.36, highlight);
			}
		}
		this.length(canvas, x, y, dimensions, hair, color, motion, viewName);
	}

	static length(canvas, x, y, dimensions, hair, color, motion, viewName) {
		const length = { short: 10, medium: 28, long: 60, veryLong: 90 }[hair.length] || 24;
		if (length <= 12) return;
		const profileBias = String(viewName).includes('side') ? 0.78 : 1;
		for (const side of [-1, 1]) {
			const sway = Math.sin(motion + side * 1.1) * 4 * dimensions.scale;
			canvas.line(
				x + side * dimensions.headWidth * 0.39,
				y - 2,
				x + side * dimensions.headWidth * 0.42 + sway,
				y + length * dimensions.scale * profileBias,
				9 * dimensions.scale,
				color
			);
		}
	}

	static facialHair(canvas, x, y, dimensions, character, profile, direction) {
		const facial = character.facialHair || {};
		const color = facial.color || character.palette.hair;
		const beard = facial.beard?.style || 'none';
		if (beard !== 'none') {
			const width = profile
				? dimensions.headWidth * 0.3
				: dimensions.headWidth * (beard === 'goatee' ? 0.22 : 0.47);
			const ratio = { stubble: 0.12, short: 0.2, boxed: 0.28, full: 0.38, long: 0.72, goatee: 0.38 }[beard] || 0.3;
			const beardX = profile ? x + direction * dimensions.headWidth * 0.28 : x;
			canvas.ellipse(beardX, y + dimensions.headHeight * 0.37, width, dimensions.headHeight * ratio, color);
			canvas.ellipse(beardX, y + dimensions.headHeight * 0.31, width * 0.72, dimensions.headHeight * ratio * 0.45, ColorTone.lighten(color, 0.1));
		}
		const mustache = facial.mustache?.style || 'none';
		if (mustache === 'none') return;
		const width = dimensions.headWidth * ({ pencil: 0.22, natural: 0.3, handlebar: 0.42, walrus: 0.36 }[mustache] || 0.3);
		const mustacheX = profile ? x + direction * dimensions.headWidth * 0.34 : x;
		canvas.line(mustacheX - width, y + 7, mustacheX + width, y + 7, 4 * dimensions.scale, color);
	}
}
