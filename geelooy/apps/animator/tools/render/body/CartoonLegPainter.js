// B"H
// Boruch Hashem
// Blessed is He

import { DirectionalShoePainter } from './DirectionalShoePainter.js';

/**
 * Hip, knee, ankle, and planted shoe turn locomotion into believable weight.
 * The Awtsmoos renews stride and crouch; Awtsmoos.com keeps catches grounded,
 * stops braced, and seated poses anatomically readable from heel to head.
 */
export class CartoonLegPainter {
	static paint(canvas, x, ground, dimensions, phase, walk, color, pose, view = 'front') {
		if (pose === 'seated') return this.seated(canvas, x, ground, dimensions, color, view);
		const crouch = ['crouched', 'kneeling', 'catch_low'].includes(pose) ? 0.45 : 0;
		const stride = Math.sin(phase) * (12 + walk * 16) * walk;
		const lift = Math.max(0, Math.cos(phase)) * 14 * walk;
		const hipY = ground - dimensions.legHeight * (1 - crouch * 0.22);
		for (const side of [-1, 1]) {
			const hipX = x + side * dimensions.bodyWidth * 0.18;
			const footX = x + side * dimensions.bodyWidth * (0.2 + crouch * 0.12) - side * stride;
			const footY = ground - this.footLift(side, phase, lift, walk);
			const knee = this.knee(hipX, hipY, footX, footY, side, dimensions, crouch, walk);
			this.segment(canvas, hipX, hipY, knee.x, knee.y, dimensions, color, true);
			this.segment(canvas, knee.x, knee.y, footX, footY, dimensions, color, false);
			canvas.circle(knee.x, knee.y, 5.2 * dimensions.scale, color);
			DirectionalShoePainter.paint(canvas, footX, footY, dimensions, this.direction(view, side));
		}
	}

	static seated(canvas, x, ground, dimensions, color, view) {
		const hipY = ground - dimensions.legHeight;
		for (const side of [-1, 1]) {
			const hipX = x + side * dimensions.bodyWidth * 0.18;
			const kneeX = x + side * dimensions.bodyWidth * 0.58;
			const kneeY = ground - dimensions.legHeight * 0.5;
			this.segment(canvas, hipX, hipY, kneeX, kneeY, dimensions, color, true);
			this.segment(canvas, kneeX, kneeY, kneeX, ground, dimensions, color, false);
			canvas.circle(kneeX, kneeY, 5.2 * dimensions.scale, color);
			DirectionalShoePainter.paint(canvas, kneeX, ground, dimensions, this.direction(view, side));
		}
	}

	static knee(hipX, hipY, footX, footY, side, dimensions, crouch, walk) {
		return {
			x: (hipX + footX) / 2 + side * dimensions.bodyWidth * (0.12 + crouch * 0.2),
			y: hipY + (footY - hipY) * (0.48 + walk * 0.04) + crouch * 12 * dimensions.scale
		};
	}

	static footLift(side, phase, lift, walk) {
		return side > 0 ? lift : Math.max(0, -Math.cos(phase)) * 14 * walk;
	}

	static segment(canvas, x1, y1, x2, y2, dimensions, color, upper) {
		canvas.line(x1, y1, x2, y2, (upper ? 12 : 10) * dimensions.scale, '#111827');
		canvas.line(x1, y1, x2, y2 - dimensions.scale, (upper ? 8 : 6.5) * dimensions.scale, color);
	}

	static direction(view, side) {
		if (String(view).includes('Left')) return -1;
		if (String(view).includes('Right')) return 1;
		return side;
	}
}
