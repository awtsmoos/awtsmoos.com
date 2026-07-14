// B"H
// Boruch Hashem
// Blessed is He

import { CartoonPropPainter } from './CartoonPropPainter.js';
import { CharacterStancePainter } from './CharacterStancePainter.js';

/**
 * Torso, limbs, chair, and held object become one readable silhouette. The
 * Awtsmoos is beyond every body, yet renews each body from nothing; Awtsmoos.com
 * uses this vessel to distinguish walking, standing, and seated performance.
 */
export class CartoonBodyPainter {
	static paint(canvas, character, placement, dimensions, performance = {}) {
		const { x, ground, phase, walk, bob } = placement;
		CharacterStancePainter.behind(canvas, x, ground, dimensions, performance.pose);
		this.shadow(canvas, x, ground, dimensions.bodyWidth);
		this.legs(canvas, x, ground + bob, dimensions, phase, walk, character.palette.secondary, performance.pose);
		const torsoTop = ground - dimensions.legHeight - dimensions.torsoHeight + bob;
		this.torso(canvas, x, torsoTop, dimensions, character);
		const shoulderY = ground - dimensions.legHeight - dimensions.torsoHeight * 0.7 + bob;
		this.arms(canvas, x, shoulderY, dimensions, phase, walk, character);
		CartoonPropPainter.paint(
			canvas,
			performance.prop,
			x + dimensions.bodyWidth * 0.48,
			shoulderY + dimensions.torsoHeight * 0.35,
			dimensions.scale
		);
		return torsoTop;
	}

	static shadow(canvas, x, y, width) {
		canvas.ellipse(x, y + 4, width * 0.62, 7, '#263238');
	}

	static legs(canvas, x, ground, dimensions, phase, walk, color, pose) {
		if (pose === 'seated') {
			this.seatedLegs(canvas, x, ground, dimensions, color);
			return;
		}
		const swing = Math.sin(phase) * 12 * walk;
		const hipY = ground - dimensions.legHeight;
		for (const side of [-1, 1]) {
			const hipX = x + side * dimensions.bodyWidth * 0.18;
			const footX = x + side * dimensions.bodyWidth * 0.2 - side * swing;
			this.limb(canvas, hipX, hipY, footX, ground, dimensions, color);
		}
	}

	static seatedLegs(canvas, x, ground, dimensions, color) {
		const hipY = ground - dimensions.legHeight;
		for (const side of [-1, 1]) {
			const hipX = x + side * dimensions.bodyWidth * 0.18;
			const kneeX = x + side * dimensions.bodyWidth * 0.58;
			const kneeY = ground - dimensions.legHeight * 0.5;
			this.limb(canvas, hipX, hipY, kneeX, kneeY, dimensions, color);
			this.limb(canvas, kneeX, kneeY, kneeX, ground, dimensions, color);
		}
	}

	static limb(canvas, x1, y1, x2, y2, dimensions, color) {
		canvas.line(x1, y1, x2, y2, 11 * dimensions.scale, '#111827');
		canvas.line(x1, y1, x2, y2 - 2, 7 * dimensions.scale, color);
	}

	static torso(canvas, x, top, dimensions, character) {
		const centerY = top + dimensions.torsoHeight * 0.52;
		canvas.ellipse(x, centerY, dimensions.bodyWidth * 0.54, dimensions.torsoHeight * 0.56, '#111827');
		canvas.ellipse(x, centerY, dimensions.bodyWidth * 0.47, dimensions.torsoHeight * 0.49, character.palette.primary);
		canvas.rect(x - dimensions.bodyWidth * 0.35, top + dimensions.torsoHeight * 0.72, dimensions.bodyWidth * 0.7, 8 * dimensions.scale, character.palette.accent);
	}

	static arms(canvas, x, shoulderY, dimensions, phase, walk, character) {
		const swing = Math.sin(phase) * 18 * walk;
		const gesture = character.role === 'wildToddler' ? Math.sin(phase * 0.5) * 14 : 0;
		for (const side of [-1, 1]) {
			const shoulderX = x + side * dimensions.bodyWidth * 0.42;
			const handX = x + side * dimensions.bodyWidth * 0.72 - side * swing;
			const handY = shoulderY + dimensions.torsoHeight * 0.62 + side * gesture;
			this.limb(canvas, shoulderX, shoulderY, handX, handY, dimensions, character.palette.primary);
			canvas.circle(handX, handY, 7 * dimensions.scale, character.palette.skin);
		}
	}
}
