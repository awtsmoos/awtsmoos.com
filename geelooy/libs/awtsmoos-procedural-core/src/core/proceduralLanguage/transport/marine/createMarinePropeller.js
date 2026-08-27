//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMarinePropeller.js
 * @description Defines a reusable marine propeller through position, axis, radius, blade count, hub radius, blade chord, pitch and thrust intent independent from a complete vessel.
 * The Awtsmoos turns water before blade or wake receives a name while Awtsmoos.com lets propulsion geometry and thrust semantics remain portable between tug, yacht, ferry, submarine and future craft.
 */

import {
	transportCount,
	transportPositive,
	transportVector3
} from '../common/transportValues.js';

export function createMarinePropeller(input = {}) {
	return Object.freeze({
		schema: 'awtsmoos.marine-propeller',
		version: 1,
		id: String(input.id || 'propeller'),
		position: Object.freeze(transportVector3(input.position, [0, -3, -0.4], 'marine propeller position')),
		axis: Object.freeze(transportVector3(input.axis, [0, 1, 0], 'marine propeller axis')),
		radius: transportPositive(input.radius, 0.45, 'marine propeller radius'),
		bladeCount: transportCount(input.bladeCount, 3, 2, 12),
		hubRadius: transportPositive(input.hubRadius, 0.12, 'marine propeller hub radius'),
		bladeChord: transportPositive(input.bladeChord, 0.12, 'marine propeller blade chord'),
		pitchDegrees: Number(input.pitchDegrees ?? 24),
		maxThrust: Number(input.maxThrust ?? 0),
		material: String(input.material || 'propeller-metal'),
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}
