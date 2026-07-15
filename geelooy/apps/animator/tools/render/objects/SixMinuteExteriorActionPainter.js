// B"H
// Boruch Hashem
// Blessed is He

import { BeaconFragmentPainter as Beacon } from './BeaconFragmentPainter.js';

/**
 * Exterior action is shaped by weather, water, roofs, bridges, gardens, and
 * public space. The Awtsmoos renews each open-air danger while Awtsmoos.com
 * keeps every location's motion readable across wide and tracking shots.
 */
export class SixMinuteExteriorActionPainter {
	static supports(environment) {
		return [
			'floodedStreet', 'marketCanopy', 'riverBridge',
			'rooftopGardens', 'dawnPlaza'
		].includes(environment);
	}

	static paint(canvas, environment, phase) {
		this[environment]?.(canvas, phase);
	}

	static floodedStreet(canvas, phase) {
		for (let index = 0; index < 18; index += 1) {
			const x = (index * 47 + phase * 74) % 700 - 30;
			canvas.line(x, 260 + index % 4 * 11, x + 38, 255 + index % 4 * 11, 2, '#d9f7ff');
		}
		Beacon.fragment(canvas, 410 + Math.sin(phase * 1.7) * 96, 234 + Math.cos(phase * 2.1) * 18, '#66f0ff', phase);
		canvas.line(74, 62, 560, 240, 3, '#f8fbff');
	}

	static marketCanopy(canvas, phase) {
		for (let index = 0; index < 7; index += 1) {
			const y = 96 - Math.max(0, Math.sin(phase * 1.4 + index)) * 56;
			canvas.line(index * 98, y, index * 98 + 88, y + 20, 8, index % 2 ? '#ef476f' : '#ffd166');
		}
		Beacon.fragment(canvas, 340 + Math.sin(phase) * 150, 72, '#ff9c45', phase);
	}

	static riverBridge(canvas, phase) {
		for (let index = 0; index < 9; index += 1) {
			const x = 58 + index * 66;
			const vibration = Math.sin(phase * 6 + index) * 12;
			canvas.line(x, 176, x + vibration, 246, 3, index % 3 ? '#b4c1d0' : '#ff756a');
		}
		Beacon.fragment(canvas, 510 - (phase * 76 % 410), 154, '#ff6655', phase);
	}

	static rooftopGardens(canvas, phase) {
		Beacon.orbit(canvas, 320, 116, phase * 0.74, 6, 108);
		for (let index = 0; index < 30; index += 1) {
			const x = (index * 71 + phase * 124) % 700 - 20;
			const y = (index * 43 + phase * 182) % 260;
			canvas.line(x, y, x - 9, y + 18, 2, '#b7ddff');
		}
	}

	static dawnPlaza(canvas, phase) {
		Beacon.orbit(canvas, 320, 116, phase * 0.32, 6, 74 + Math.sin(phase * 0.7) * 12);
		for (let index = 0; index < 18; index += 1) {
			const x = 30 + index * 36;
			canvas.circle(x, 254 + Math.sin(phase + index) * 6, 4, index % 3 ? '#ffd57a' : '#8ae9ff');
		}
	}
}
