// B"H
// Boruch Hashem
// Blessed is He

import { ColorTone } from '../color/ColorTone.js';

/**
 * Sleeves, coat opening, trouser seams, skirt panels, folds, and hems reveal
 * material weight. The Awtsmoos renews each sway; Awtsmoos.com lets cloth follow
 * breath and action while locked hands remain fixed in their chosen display.
 */
export class GarmentMotionPainter {
	static paint(canvas, character, placement, dimensions, performance = {}) {
		const time = Number(performance.timeMs || 0);
		const action = Number(performance.walk || 0) + Number(performance.exertion || 0);
		const sway = Math.sin(time / 420 + character.identityId.length) * (2.2 + action * 2.4) * dimensions.scale;
		const waistY = placement.torsoTop + dimensions.torsoHeight * 0.72;
		this.sleeves(canvas, placement.x, placement.torsoTop, dimensions, character);
		if (character.role === 'calmObserver') {
			this.skirt(canvas, placement.x, waistY, placement.ground, dimensions, character, sway);
		} else {
			this.coat(canvas, placement.x, waistY, dimensions, character, sway);
			this.trousers(canvas, placement.x, placement.ground, dimensions, character);
		}
	}

	static sleeves(canvas, x, top, dimensions, character) {
		const shadow = ColorTone.darken(character.palette.primary, 0.28);
		for (const side of [-1, 1]) {
			canvas.line(
				x + side * dimensions.bodyWidth * 0.42, top + dimensions.torsoHeight * 0.2,
				x + side * dimensions.bodyWidth * 0.52, top + dimensions.torsoHeight * 0.48,
				3 * dimensions.scale, shadow
			);
		}
	}

	static skirt(canvas, x, waistY, ground, dimensions, character, sway) {
		const bottomY = Math.min(ground - dimensions.legHeight * 0.16, waistY + dimensions.torsoHeight * 0.92);
		const shadow = ColorTone.darken(character.palette.secondary, 0.26);
		for (const side of [-1, 1]) {
			canvas.line(x + side * dimensions.bodyWidth * 0.34, waistY, x + side * dimensions.bodyWidth * 0.5 + sway, bottomY, 10 * dimensions.scale, '#111827');
			canvas.line(x + side * dimensions.bodyWidth * 0.33, waistY, x + side * dimensions.bodyWidth * 0.46 + sway, bottomY, 7 * dimensions.scale, character.palette.secondary);
		}
		canvas.line(x - dimensions.bodyWidth * 0.46 + sway, bottomY, x + dimensions.bodyWidth * 0.46 + sway, bottomY, 3 * dimensions.scale, shadow);
		canvas.line(x, waistY + 8, x + sway * 0.4, bottomY - 4, 1.2 * dimensions.scale, shadow);
	}

	static coat(canvas, x, waistY, dimensions, character, sway) {
		const hemY = waistY + dimensions.torsoHeight * 0.42;
		const shadow = ColorTone.darken(character.palette.primary, 0.3);
		canvas.line(x, waistY, x + sway, hemY, 2 * dimensions.scale, character.palette.accent);
		canvas.line(x - dimensions.bodyWidth * 0.34, hemY, x + dimensions.bodyWidth * 0.34, hemY, 3 * dimensions.scale, shadow);
		canvas.line(x - dimensions.bodyWidth * 0.24, waistY, x - dimensions.bodyWidth * 0.29 + sway * 0.2, hemY, 1.2 * dimensions.scale, shadow);
		canvas.line(x + dimensions.bodyWidth * 0.24, waistY, x + dimensions.bodyWidth * 0.29 + sway * 0.2, hemY, 1.2 * dimensions.scale, shadow);
	}

	static trousers(canvas, x, ground, dimensions, character) {
		const seam = ColorTone.darken(character.palette.secondary, 0.32);
		canvas.line(x, ground - dimensions.legHeight * 0.92, x, ground - 8 * dimensions.scale, 1.2 * dimensions.scale, seam);
	}
}
