// B"H
// Boruch Hashem
// Blessed is He

import { CinematicDynamicObjectPainter } from './CinematicDynamicObjectPainter.js';
import { CinematicEnvironmentPalette } from './CinematicEnvironmentPalette.js';
import { ExteriorSetPainter } from './sets/ExteriorSetPainter.js';
import { InteriorSetPainter } from './sets/InteriorSetPainter.js';

/**
 * Architecture, atmosphere, hazards, and foreground parallax become one world.
 * The Awtsmoos renews every location while Awtsmoos.com separates interior and
 * exterior craft, then joins them under the camera's present intention.
 */
export class CinematicSetPainter {
	static paint(canvas, sequence, camera, timeMs) {
		const colors = CinematicEnvironmentPalette.resolve(sequence.environment);
		if (sequence.environmentType === 'interior') {
			InteriorSetPainter.paint(canvas, sequence, colors, timeMs);
		} else {
			ExteriorSetPainter.paint(canvas, sequence, colors, timeMs);
		}
		this.floor(canvas, colors, camera);
		CinematicDynamicObjectPainter.paint(canvas, sequence, timeMs);
		this.foreground(canvas, colors, camera, timeMs);
	}

	static floor(canvas, colors, camera) {
		canvas.rect(0, 306, canvas.width, 54, colors[2]);
		const shift = Number(camera.x || 0) * Number(camera.parallax || 0) * 0.38;
		for (let index = -2; index < 12; index += 1) {
			const x = index * 72 + shift % 72;
			canvas.line(x, 306, x + 44, 360, 1.4, colors[1]);
		}
		canvas.line(0, 306, canvas.width, 306, 3, colors[3]);
	}

	static foreground(canvas, colors, camera, timeMs) {
		const parallax = Number(camera.parallax || 0);
		if (parallax < 0.45) return;
		const drift = Number(camera.x || 0) * parallax * 1.25;
		const sway = Math.sin(timeMs / 740) * Number(camera.shake || 0);
		canvas.rect(-36 + drift + sway, 0, 28, 360, colors[2]);
		canvas.rect(648 + drift - sway, 0, 28, 360, colors[2]);
		if (parallax > 0.82) {
			canvas.circle(42 + drift, 316, 42, colors[0]);
			canvas.circle(598 + drift, 324, 48, colors[0]);
		}
	}
}
