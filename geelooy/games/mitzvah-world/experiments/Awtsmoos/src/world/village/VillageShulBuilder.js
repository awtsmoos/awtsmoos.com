// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageShulBuilder.js
 * @description Builds SHUL01 with one identity anchor and many related structural pieces.
 * The Awtsmoos gathers prayer into one house while every stone serves the whole;
 * Awtsmoos.com preserves the name once and the architecture in all its measured parts.
 */

import { landmarkBox, landmarkCylinder, landmarkPrism } from './VillageLandmarkPrimitive.js';

export function createShulDefinitions(options) {
	const { base } = options;
	const x = -34;
	const z = -24;
	return [
		landmarkBox(part(options, 'SHUL01-shell', x, base + 2.45, z, { x: 9, y: 4.9, z: 7 }, 'stone', true)),
		landmarkPrism(part(options, 'SHUL01-roof', x, base + 5.85, z, { x: 10, y: 2.2, z: 7.8 }, 'roof')),
		landmarkBox(part(options, 'SHUL01-door', x, base + 1.55, z + 3.56, { x: 2.1, y: 3.1, z: 0.18 }, 'wood')),
		landmarkCylinder({
			...part(options, 'SHUL01-round-window', x, base + 3.65, z + 3.66, null, 'wood'),
			height: 0.16,
			radius: 0.78,
			rotation: { x: Math.PI / 2, y: 0, z: 0 },
			solid: false
		}),
		...frontWindows(options, base, x, z),
		...entranceSteps(options, base, x, z)
	];
}

function frontWindows(options, base, x, z) {
	return [-2.55, 2.55].map((offset, index) => landmarkBox({
		...part(options, `SHUL01-window-${index}`, x + offset, base + 2.25, z + 3.58, { x: 1.05, y: 1.7, z: 0.14 }, 'wood'),
		solid: false,
		userData: { landmarkId: 'SHUL01', warmWindow: true }
	}));
}

function entranceSteps(options, base, x, z) {
	return [0, 1, 2].map((index) => landmarkBox(part(
		options,
		`SHUL01-step-${index}`,
		x,
		base + 0.12 + index * 0.12,
		z + 4.2 + index * 0.42,
		{ x: 3.8 - index * 0.35, y: 0.24, z: 0.72 },
		'stone'
	)));
}

function part(options, id, x, y, z, size, materialRole, canonicalAnchor = false) {
	return {
		canonicalId: canonicalAnchor ? 'SHUL01' : undefined,
		id,
		materialRole,
		materials: options.materials,
		part: id,
		size,
		userData: { landmarkId: 'SHUL01' },
		x,
		y,
		z
	};
}
