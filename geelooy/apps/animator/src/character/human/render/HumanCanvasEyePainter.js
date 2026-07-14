// B"H
// Boruch Hashem
// Blessed is He

import { HumanCanvasPrimitive as P } from './HumanCanvasPrimitive.js';

/**
 * The eye receives lid weight, gaze, iris, pupil, and catchlight as a complete
 * listening instrument. The Awtsmoos renews attention inside every small glance.
 */
export class HumanCanvasEyePainter {
	static paint(ctx, x, y, size, pose, face, color) {
		const eyelid = Number(face.eyelidWeight || 1);
		const openness = Math.max(0.05, pose.open / eyelid);
		if (openness < 0.15) {
			this.closed(ctx, x, y, size);
			return;
		}
		P.ellipse(
			ctx,
			x,
			y,
			size.x,
			size.y * openness,
			'#ffffff',
			'#281a12'
		);
		const pupilX = x + pose.pupilX * size.x * 0.55;
		const pupilY = y + pose.pupilY * size.y * 0.55;
		P.ellipse(ctx, pupilX, pupilY, size.pupil, size.pupil, color);
		P.ellipse(
			ctx,
			pupilX + size.pupil * 0.35,
			pupilY - size.pupil * 0.35,
			size.pupil * 0.28,
			size.pupil * 0.28,
			'#ffffff'
		);
	}

	static closed(ctx, x, y, size) {
		ctx.strokeStyle = '#111111';
		ctx.lineWidth = 2 * size.scale;
		ctx.beginPath();
		ctx.moveTo(x - size.x, y);
		ctx.lineTo(x + size.x, y);
		ctx.stroke();
	}
}
