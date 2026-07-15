// B"H
// Boruch Hashem
// Blessed is He

import { CartoonPropPainter } from './CartoonPropPainter.js';
import { CharacterStancePainter } from './CharacterStancePainter.js';
import { GesturePoseResolver } from './performance/GesturePoseResolver.js';

/**
 * Torso, limbs, weight, gesture, and held objects become one action silhouette.
 * The Awtsmoos is beyond every body yet renews each body from nothing, while
 * Awtsmoos.com makes running, bracing, reaching, climbing, and carrying visible.
 */
export class CartoonBodyPainter {
	static paint(canvas, character, placement, dimensions, performance = {}) {
		const { x, ground, phase, walk, bob } = placement;
		const lean = Number(performance.lean || 0);
		const torsoX = x + lean * dimensions.bodyWidth * 0.32;
		CharacterStancePainter.behind(canvas, x, ground, dimensions, performance.pose);
		this.shadow(canvas, x, ground, dimensions.bodyWidth, walk);
		this.legs(canvas, x, ground + bob, dimensions, phase, walk, character.palette.secondary, performance.pose);
		const torsoTop = ground - dimensions.legHeight - dimensions.torsoHeight + bob;
		this.torso(canvas, torsoX, torsoTop, dimensions, character, lean);
		const shoulderY = ground - dimensions.legHeight - dimensions.torsoHeight * 0.7 + bob;
		this.arms(canvas, torsoX, shoulderY, dimensions, phase, walk, character, performance);
		CartoonPropPainter.paint(
			canvas,
			performance.prop,
			torsoX + dimensions.bodyWidth * 0.48,
			shoulderY + dimensions.torsoHeight * 0.34,
			dimensions.scale
		);
		return torsoTop;
	}

	static shadow(canvas, x, y, width, walk) {
		canvas.ellipse(x, y + 4, width * (0.62 + walk * 0.08), 7, '#263238');
	}

	static legs(canvas, x, ground, dimensions, phase, walk, color, pose) {
		if (pose === 'seated') {
			this.seatedLegs(canvas, x, ground, dimensions, color);
			return;
		}
		const stride = Math.sin(phase) * (12 + walk * 16) * walk;
		const lift = Math.max(0, Math.cos(phase)) * 14 * walk;
		const hipY = ground - dimensions.legHeight;
		for (const side of [-1, 1]) {
			const hipX = x + side * dimensions.bodyWidth * 0.18;
			const footX = x + side * dimensions.bodyWidth * 0.2 - side * stride;
			const footY = ground - (side > 0 ? lift : Math.max(0, -Math.cos(phase)) * 14 * walk);
			this.limb(canvas, hipX, hipY, footX, footY, dimensions, color);
			canvas.line(footX - 7 * dimensions.scale, footY, footX + 10 * dimensions.scale, footY, 5 * dimensions.scale, '#101218');
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

	static torso(canvas, x, top, dimensions, character, lean) {
		const centerY = top + dimensions.torsoHeight * 0.52;
		const tilt = lean * dimensions.torsoHeight * 0.08;
		canvas.ellipse(x, centerY + tilt, dimensions.bodyWidth * 0.54, dimensions.torsoHeight * 0.56, '#111827');
		canvas.ellipse(x, centerY, dimensions.bodyWidth * 0.47, dimensions.torsoHeight * 0.49, character.palette.primary);
		canvas.rect(x - dimensions.bodyWidth * 0.35, top + dimensions.torsoHeight * 0.72, dimensions.bodyWidth * 0.7, 8 * dimensions.scale, character.palette.accent);
	}

	static arms(canvas, x, shoulderY, dimensions, phase, walk, character, performance) {
		for (const side of [-1, 1]) {
			const shoulderX = x + side * dimensions.bodyWidth * 0.42;
			const target = GesturePoseResolver.arms(performance.gesture, side, dimensions, phase, walk);
			const handX = x + target.x;
			const handY = shoulderY + target.y;
			this.limb(canvas, shoulderX, shoulderY, handX, handY, dimensions, character.palette.primary);
			canvas.circle(handX, handY, 7 * dimensions.scale, character.palette.skin);
		}
	}
}
