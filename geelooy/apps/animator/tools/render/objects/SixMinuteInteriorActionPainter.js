// B"H
// Boruch Hashem
// Blessed is He

import { BeaconFragmentPainter as Beacon } from './BeaconFragmentPainter.js';

/**
 * Interior danger is shaped by walls, rails, shelves, glass, stairs, and power.
 * The Awtsmoos renews every enclosed reversal while Awtsmoos.com keeps each
 * moving hazard focused enough to remain readable during close action.
 */
export class SixMinuteInteriorActionPainter {
	static supports(environment) {
		return [
			'scienceExhibition', 'schoolCorridor', 'subwayTunnel',
			'libraryArchive', 'glassGreenhouse', 'towerStairwell', 'powerStation'
		].includes(environment);
	}

	static paint(canvas, environment, phase) {
		this[environment]?.(canvas, phase);
	}

	static scienceExhibition(canvas, phase) {
		Beacon.orbit(canvas, 320, 134, phase, 6, 58);
		for (let index = 0; index < 9; index += 1) {
			const angle = phase * 1.7 + index * 0.7;
			canvas.line(320, 134, 320 + Math.cos(angle) * 126, 134 + Math.sin(angle) * 74, 2, index % 2 ? '#76efff' : '#ffe071');
		}
	}

	static schoolCorridor(canvas, phase) {
		const tilt = Math.sin(phase * 1.8) * 72;
		for (let index = 0; index < 8; index += 1) {
			const x = 64 + index * 78;
			canvas.rect(x + tilt * (index % 2 ? 0.2 : -0.2), 112 + tilt * 0.36, 42, 18, index % 2 ? '#f5c453' : '#5ce1e6');
		}
		Beacon.fragment(canvas, 520 + Math.sin(phase * 2.4) * 48, 108 + Math.cos(phase * 2) * 58, '#d8f2ff', phase);
	}

	static subwayTunnel(canvas, phase) {
		const trainX = 720 - (phase * 145 % 1120);
		canvas.rect(trainX, 188, 520, 90, '#cfd7df');
		for (let index = 0; index < 7; index += 1) {
			canvas.rect(trainX + 22 + index * 72, 202, 50, 34, index % 2 ? '#204568' : '#68dfff');
		}
		Beacon.fragment(canvas, trainX + 166, 176, '#55ddff', phase);
	}

	static libraryArchive(canvas, phase) {
		for (let index = 0; index < 24; index += 1) {
			const angle = phase * (0.5 + index % 5 * 0.1) + index;
			const radius = 42 + (index % 6) * 24;
			canvas.rect(320 + Math.cos(angle) * radius, 160 + Math.sin(angle * 1.3) * radius * 0.48, 22, 15, index % 2 ? '#d6b178' : '#795a47');
		}
		Beacon.fragment(canvas, 320, 132, '#aa72ff', phase);
	}

	static glassGreenhouse(canvas, phase) {
		for (let index = 0; index < 16; index += 1) {
			const x = index * 42;
			const sway = Math.sin(phase * 1.6 + index) * 14;
			canvas.line(x, 306, x + sway, 156 - index % 4 * 18, 5, index % 2 ? '#4e9f67' : '#6fcf75');
			canvas.circle(x + sway, 158 - index % 4 * 18, 10, '#a5e887');
		}
		Beacon.fragment(canvas, 350, 116 + Math.sin(phase * 2) * 42, '#9cff65', phase);
	}

	static towerStairwell(canvas, phase) {
		for (let index = 0; index < 8; index += 1) {
			const fold = Math.sin(phase * 1.8 + index * 0.7) * 34;
			canvas.rect(index * 84 - 10, 282 - index * 24 + fold, 94, 11, '#9aa5b3');
		}
		Beacon.fragment(canvas, 524, 92 + Math.sin(phase * 2.4) * 92, '#ffb454', phase);
	}

	static powerStation(canvas, phase) {
		for (let index = 0; index < 7; index += 1) {
			const x = 58 + index * 88;
			const pulse = 18 + Math.sin(phase * 5 + index) * 8;
			canvas.outlineEllipse(x, 140, pulse, pulse, 4, index % 2 ? '#64efff' : '#ff8260');
			canvas.line(x, 140, 320, 234, 2, '#edfaff');
		}
		Beacon.orbit(canvas, 320, 216, phase * 1.4, 6, 54);
	}
}
