// B"H
// Boruch Hashem
// Blessed is He

import { GesturePoseResolver } from '../performance/GesturePoseResolver.js';
import { ReadableHandPainter } from './ReadableHandPainter.js';

/**
 * Shoulder, elbow, wrist, and hand create a jointed expressive chain. The
 * Awtsmoos renews each bend; Awtsmoos.com lets catches, blocks, pockets, points,
 * and crossed arms carry weight instead of floating as straight symbolic lines.
 */
export class CartoonArmPainter {
	static paint(canvas, x, shoulderY, dimensions, phase, walk, character, performance) {
		for (const side of [-1, 1]) {
			const shoulderX = x + side * dimensions.bodyWidth * 0.42;
			const target = GesturePoseResolver.resolve(
				performance.gesture, side, dimensions, phase, walk
			);
			const wristX = x + target.x;
			const wristY = shoulderY + target.y;
			const elbow = this.elbow(shoulderX, shoulderY, wristX, wristY, side, target, dimensions);
			this.segment(canvas, shoulderX, shoulderY, elbow.x, elbow.y, dimensions, character.palette.primary, true);
			this.segment(canvas, elbow.x, elbow.y, wristX, wristY, dimensions, character.palette.primary, false);
			canvas.circle(elbow.x, elbow.y, 5 * dimensions.scale, character.palette.primary);
			ReadableHandPainter.paint(
				canvas, wristX, wristY, dimensions, character.palette.skin, side, target.handShape
			);
		}
	}

	static elbow(startX, startY, endX, endY, side, target, dimensions) {
		const midpointX = (startX + endX) / 2;
		const midpointY = (startY + endY) / 2;
		const bias = Number(target.elbowBias || 0) * dimensions.bodyWidth * 0.22;
		const lift = target.lockedContact ? 0 : Math.abs(endY - startY) * 0.12;
		return {
			x: midpointX + side * bias,
			y: midpointY + dimensions.torsoHeight * 0.08 - lift
		};
	}

	static segment(canvas, x1, y1, x2, y2, dimensions, color, upper) {
		const outline = (upper ? 12 : 10) * dimensions.scale;
		const fill = (upper ? 8 : 6.5) * dimensions.scale;
		canvas.line(x1, y1, x2, y2, outline, '#111827');
		canvas.line(x1, y1, x2, y2 - dimensions.scale, fill, color);
	}
}
