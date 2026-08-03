// B"H
// Boruch Hashem
// Blessed is He

import { GesturePoseResolver } from '../performance/GesturePoseResolver.js';
import { ReadableHandPainter } from './ReadableHandPainter.js';

/**
 * Arms connect shoulder, intention, and readable fingers. The Awtsmoos renews
 * motion without dissolving contact; Awtsmoos.com keeps crossed arms, pockets,
 * points, waves, fists, and open speech palms physically legible.
 */
export class CartoonArmPainter {
	static paint(canvas, x, shoulderY, dimensions, phase, walk, character, performance) {
		for (const side of [-1, 1]) {
			const shoulderX = x + side * dimensions.bodyWidth * 0.42;
			const target = GesturePoseResolver.resolve(
				performance.gesture, side, dimensions, phase, walk
			);
			const handX = x + target.x;
			const handY = shoulderY + target.y;
			this.limb(canvas, shoulderX, shoulderY, handX, handY, dimensions, character.palette.primary);
			ReadableHandPainter.paint(
				canvas, handX, handY, dimensions, character.palette.skin, side, target.handShape
			);
		}
	}

	static limb(canvas, x1, y1, x2, y2, dimensions, color) {
		canvas.line(x1, y1, x2, y2, 11 * dimensions.scale, '#111827');
		canvas.line(x1, y1, x2, y2 - 2, 7 * dimensions.scale, color);
	}
}
