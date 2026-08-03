// B"H
// Boruch Hashem
// Blessed is He

import { CartoonPropPainter } from './CartoonPropPainter.js';
import { CharacterStancePainter } from './CharacterStancePainter.js';
import { CartoonArmPainter } from './body/CartoonArmPainter.js';
import { CartoonLegPainter } from './body/CartoonLegPainter.js';
import { GarmentMotionPainter } from './body/GarmentMotionPainter.js';

/**
 * Torso, grounded legs, directional shoes, garments, arms, hands, and props
 * become one readable actor. The Awtsmoos renews the body each frame while
 * Awtsmoos.com preserves locked contact beneath breath and secondary motion.
 */
export class CartoonBodyPainter {
	static paint(canvas, character, placement, dimensions, performance = {}) {
		const { x, ground, phase, walk, bob } = placement;
		const lean = Number(performance.lean || 0);
		const torsoX = x + lean * dimensions.bodyWidth * 0.32;
		CharacterStancePainter.behind(canvas, x, ground, dimensions, performance.pose);
		this.shadow(canvas, x, ground, dimensions.bodyWidth, walk);
		CartoonLegPainter.paint(
			canvas, x, ground + bob, dimensions, phase, walk,
			character.palette.secondary, performance.pose, performance.view
		);
		const torsoTop = ground - dimensions.legHeight - dimensions.torsoHeight + bob;
		this.torso(canvas, torsoX, torsoTop, dimensions, character, lean);
		GarmentMotionPainter.paint(
			canvas, character, { x: torsoX, ground, torsoTop }, dimensions, performance
		);
		const shoulderY = ground - dimensions.legHeight - dimensions.torsoHeight * 0.7 + bob;
		CartoonArmPainter.paint(
			canvas, torsoX, shoulderY, dimensions, phase, walk, character, performance
		);
		CartoonPropPainter.paint(
			canvas, performance.prop,
			torsoX + dimensions.bodyWidth * 0.48,
			shoulderY + dimensions.torsoHeight * 0.34,
			dimensions.scale
		);
		return torsoTop;
	}

	static shadow(canvas, x, y, width, walk) {
		canvas.ellipse(x, y + 4, width * (0.62 + walk * 0.08), 7, '#263238');
	}

	static torso(canvas, x, top, dimensions, character, lean) {
		const centerY = top + dimensions.torsoHeight * 0.52;
		const tilt = lean * dimensions.torsoHeight * 0.08;
		canvas.ellipse(x, centerY + tilt, dimensions.bodyWidth * 0.54, dimensions.torsoHeight * 0.56, '#111827');
		canvas.ellipse(x, centerY, dimensions.bodyWidth * 0.47, dimensions.torsoHeight * 0.49, character.palette.primary);
		canvas.rect(x - dimensions.bodyWidth * 0.35, top + dimensions.torsoHeight * 0.72, dimensions.bodyWidth * 0.7, 8 * dimensions.scale, character.palette.accent);
	}
}
