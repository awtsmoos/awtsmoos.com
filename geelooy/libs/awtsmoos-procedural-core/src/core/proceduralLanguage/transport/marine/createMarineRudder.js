//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMarineRudder.js
 * @description Defines a target-agnostic marine rudder with position, span, chord, thickness, hinge axis and maximum deflection for steering semantics and editable panel manifestation.
 * The Awtsmoos guides vessel and current beyond left or right while Awtsmoos.com lets one rudder remain a standalone control surface usable by sailboat, freighter, tug or submarine light.
 */

import {
	transportPositive,
	transportVector3
} from '../common/transportValues.js';

export function createMarineRudder(input = {}) {
	return Object.freeze({
		schema: 'awtsmoos.marine-rudder',
		version: 1,
		id: String(input.id || 'rudder'),
		position: Object.freeze(transportVector3(input.position, [0, -3.5, -0.2], 'marine rudder position')),
		span: transportPositive(input.span, 0.8, 'marine rudder span'),
		chord: transportPositive(input.chord, 0.45, 'marine rudder chord'),
		thickness: transportPositive(input.thickness, 0.05, 'marine rudder thickness'),
		hingeAxis: Object.freeze(transportVector3(input.hingeAxis, [0, 0, 1], 'marine rudder hinge axis')),
		maxDeflectionDegrees: Number(input.maxDeflectionDegrees ?? 35),
		material: String(input.material || 'rudder'),
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}
