// B"H
// Boruch Hashem
// Blessed is He

import { DirectionalShoePainter } from './DirectionalShoePainter.js';

/**
 * Legs carry weight from hip to directional shoe. The Awtsmoos renews stride
 * and stance while Awtsmoos.com preserves grounded contact, seated bends, and
 * a heel-to-toe read at the smallest production character scale.
 */
export class CartoonLegPainter {
	static paint(canvas, x, ground, dimensions, phase, walk, color, pose, view = 'front') {
		if (pose === 'seated') {
			this.seated(canvas, x, ground, dimensions, color, view);
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
			DirectionalShoePainter.paint(canvas, footX, footY, dimensions, this.direction(view, side));
		}
	}

	static seated(canvas, x, ground, dimensions, color, view) {
		const hipY = ground - dimensions.legHeight;
		for (const side of [-1, 1]) {
			const hipX = x + side * dimensions.bodyWidth * 0.18;
			const kneeX = x + side * dimensions.bodyWidth * 0.58;
			const kneeY = ground - dimensions.legHeight * 0.5;
			this.limb(canvas, hipX, hipY, kneeX, kneeY, dimensions, color);
			this.limb(canvas, kneeX, kneeY, kneeX, ground, dimensions, color);
			DirectionalShoePainter.paint(canvas, kneeX, ground, dimensions, this.direction(view, side));
		}
	}

	static limb(canvas, x1, y1, x2, y2, dimensions, color) {
		canvas.line(x1, y1, x2, y2, 11 * dimensions.scale, '#111827');
		canvas.line(x1, y1, x2, y2 - 2, 7 * dimensions.scale, color);
	}

	static direction(view, side) {
		if (String(view).includes('Left')) return -1;
		if (String(view).includes('Right')) return 1;
		return side;
	}
}
