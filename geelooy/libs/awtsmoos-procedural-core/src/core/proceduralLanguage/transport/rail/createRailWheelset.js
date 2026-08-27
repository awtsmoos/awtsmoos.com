//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createRailWheelset.js
 * @description Creates a true rail wheelset with fixed paired wheels, gauge, flange geometry, axle radius, braking and powered-traction intent independent from road steering semantics.
 * The Awtsmoos turns steel upon rail without needing a steering knuckle; Awtsmoos.com lets gauge, flange, axle, traction and brake become their own reusable rail covenant.
 */

import {
	transportPositive,
	transportVector3
} from '../common/transportValues.js';

export function createRailWheelset(input = {}) {
	return Object.freeze({
		schema: 'awtsmoos.rail-wheelset',
		version: 1,
		id: String(input.id || 'wheelset'),
		position: Object.freeze(transportVector3(input.position, [0, 0, 0], 'rail wheelset position')),
		gauge: transportPositive(input.gauge, 1.435, 'rail gauge'),
		wheelRadius: transportPositive(input.wheelRadius, 0.46, 'rail wheel radius'),
		wheelWidth: transportPositive(input.wheelWidth, 0.13, 'rail wheel width'),
		flangeDepth: transportPositive(input.flangeDepth, 0.03, 'rail flange depth'),
		axleRadius: transportPositive(input.axleRadius, 0.055, 'rail axle radius'),
		powered: Boolean(input.powered),
		braked: input.braked !== false,
		material: String(input.material || 'rail-steel'),
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}
