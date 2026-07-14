// B"H
// Boruch Hashem
// Blessed is He

import { CinematicDynamicObjectPainter } from './CinematicDynamicObjectPainter.js';
import { CinematicEnvironmentPalette } from './CinematicEnvironmentPalette.js';

/**
 * Eight locations share one stage contract without sharing one appearance. The
 * Awtsmoos renews architecture and weather while Awtsmoos.com separates indoor
 * walls from outdoor horizons, foreground depth, and location-specific objects.
 */
export class CinematicSetPainter {
	static background(canvas, sequence, timeMs) {
		const colors = CinematicEnvironmentPalette.resolve(sequence.environment);
		canvas.clear(colors[0]);
		if (sequence.environmentType === 'interior') {
			this.interior(canvas, sequence, colors);
		} else {
			this.exterior(canvas, sequence, colors, timeMs);
		}
	}

	static setDressing(canvas, sequence, timeMs) {
		CinematicDynamicObjectPainter.paint(canvas, sequence, timeMs);
	}

	static foreground(canvas, sequence) {
		const colors = CinematicEnvironmentPalette.resolve(sequence.environment);
		canvas.rect(0, 304, canvas.width, 56, colors[2]);
		if (sequence.environmentType === 'exterior') {
			canvas.rect(0, 304, canvas.width, 5, colors[3]);
		}
	}

	static interior(canvas, sequence, colors) {
		canvas.rect(0, 70, canvas.width, 234, colors[1]);
		canvas.rect(0, 286, canvas.width, 18, colors[2]);
		for (let index = 0; index < 6; index += 1) {
			canvas.rect(28 + index * 104, 96, 70, 116, index % 2 ? colors[0] : '#26334b');
		}
		if (sequence.environment === 'workshop' || sequence.environment === 'repairLab') {
			canvas.rect(56, 224, 520, 38, '#6b442c');
			canvas.rect(78, 262, 16, 42, '#3b271d');
			canvas.rect(548, 262, 16, 42, '#3b271d');
		}
	}

	static exterior(canvas, sequence, colors, timeMs) {
		canvas.rect(0, 0, canvas.width, 210, colors[0]);
		canvas.rect(0, 210, canvas.width, 94, colors[1]);
		const sunX = 520 + Math.sin(timeMs / 18000) * 36;
		if (!['rooftop', 'festivalPlaza'].includes(sequence.environment)) {
			canvas.circle(sunX, 58, 24, colors[3]);
		}
		for (let index = 0; index < 8; index += 1) {
			const height = 44 + (index % 4) * 24;
			canvas.rect(index * 84 - 10, 210 - height, 72, height, index % 2 ? '#3d4c65' : '#52617a');
		}
	}
}
