// B"H
// Boruch Hashem
// Blessed is He

import { CinematicDynamicObjectPainter } from './CinematicDynamicObjectPainter.js';
import { CinematicEnvironmentPalette } from './CinematicEnvironmentPalette.js';
import { ExteriorSetPainter } from './sets/ExteriorSetPainter.js';
import { InteriorSetPainter } from './sets/InteriorSetPainter.js';
import { RealisticOfficeSetPainter } from './sets/RealisticOfficeSetPainter.js';

/**
 * Architecture, atmosphere, floor, and parallax become one world. The Awtsmoos
 * renews every location; Awtsmoos.com routes the realistic office and established
 * sets through focused painters while preserving one camera and production light.
 */
export class CinematicSetPainter {
	static paint(canvas, sequence, camera, timeMs) {
		const colors = CinematicEnvironmentPalette.resolve(sequence.environment);
		if (sequence.environment === 'realisticOffice') {
			RealisticOfficeSetPainter.paint(canvas, colors, timeMs);
		} else if (sequence.environmentType === 'interior') {
			InteriorSetPainter.paint(canvas, sequence, colors, timeMs);
		} else {
			ExteriorSetPainter.paint(canvas, sequence, colors, timeMs);
		}
		if (sequence.environment !== 'realisticOffice') {
			this.floor(canvas, colors, camera);
			CinematicDynamicObjectPainter.paint(canvas, sequence, timeMs);
		}
		this.foreground(canvas, colors, camera, timeMs);
	}

	static floor(canvas, colors, camera) {
		const baseY = canvas.height * 0.85;
		canvas.rect(0, baseY, canvas.width, canvas.height - baseY, colors[2]);
		const shift = Number(camera.x || 0) * Number(camera.parallax || 0) * 0.38;
		for (let index = -2; index < 12; index += 1) {
			const x = index * canvas.width / 9 + shift % 72;
			canvas.line(x, baseY, x + canvas.width * 0.07, canvas.height, 1.4, colors[1]);
		}
		canvas.line(0, baseY, canvas.width, baseY, 3, colors[3]);
	}

	static foreground(canvas, colors, camera, timeMs) {
		const parallax = Number(camera.parallax || 0);
		if (parallax < 0.45) return;
		const drift = Number(camera.x || 0) * parallax * 1.25;
		const sway = Math.sin(timeMs / 740) * Number(camera.shake || 0);
		canvas.rect(-36 + drift + sway, 0, 28, canvas.height, colors[2]);
		canvas.rect(canvas.width + 8 + drift - sway, 0, 28, canvas.height, colors[2]);
	}
}
