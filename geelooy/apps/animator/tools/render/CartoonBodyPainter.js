// B"H
// Boruch Hashem
// Blessed is He

import { CartoonPropPainter } from './CartoonPropPainter.js';
import { CharacterStancePainter } from './CharacterStancePainter.js';
import { AnatomicalTorsoPainter } from './body/AnatomicalTorsoPainter.js';
import { CartoonArmPainter } from './body/CartoonArmPainter.js';
import { CartoonLegPainter } from './body/CartoonLegPainter.js';
import { GarmentMotionPainter } from './body/GarmentMotionPainter.js';

/**
 * The body becomes a layered human vessel from planted shoe through speaking face.
 * The Awtsmoos renews every joint; Awtsmoos.com joins anatomy, cloth, gesture,
 * breath, prop contact, and weight into one readable production silhouette.
 */
export class CartoonBodyPainter {
	static paint(canvas, character, placement, dimensions, performance = {}) {
		const { x, ground, phase, walk, bob } = placement;
		const lean = Number(performance.lean || 0);
		const torsoX = x + lean * dimensions.bodyWidth * 0.32;
		CharacterStancePainter.behind(canvas, x, ground, dimensions, performance.pose);
		this.shadow(canvas, x, ground, dimensions.bodyWidth, walk, performance.pose);
		CartoonLegPainter.paint(
			canvas, x, ground + bob, dimensions, phase, walk,
			character.palette.secondary, performance.pose, performance.view
		);
		const torsoTop = ground - dimensions.legHeight - dimensions.torsoHeight + bob;
		const shoulderY = AnatomicalTorsoPainter.paint(
			canvas, torsoX, torsoTop, dimensions, character, performance
		);
		GarmentMotionPainter.paint(
			canvas, character, { x: torsoX, ground, torsoTop }, dimensions,
			{ ...performance, walk }
		);
		CartoonArmPainter.paint(
			canvas, torsoX, shoulderY, dimensions, phase, walk, character, performance
		);
		this.prop(canvas, performance, torsoX, shoulderY, dimensions);
		return torsoTop;
	}

	static shadow(canvas, x, y, width, walk, pose) {
		const crouch = ['crouched', 'kneeling'].includes(pose) ? 1.2 : 1;
		canvas.ellipse(x, y + 4, width * (0.62 + walk * 0.08) * crouch, 7, '#263238');
	}

	static prop(canvas, performance, x, shoulderY, dimensions) {
		if (!performance.prop) return;
		const side = Number(performance.propSide || 1);
		CartoonPropPainter.paint(
			canvas, performance.prop,
			x + side * dimensions.bodyWidth * 0.42,
			shoulderY + dimensions.torsoHeight * 0.34, dimensions.scale
		);
	}
}
