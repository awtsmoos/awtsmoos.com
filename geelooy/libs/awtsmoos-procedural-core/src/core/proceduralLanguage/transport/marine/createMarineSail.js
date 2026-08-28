//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMarineSail.js
 * @description Defines one standalone sail through center, span, chord, thickness, normal, trim angle and material for target-agnostic marine wind propulsion assemblies.
 * The Awtsmoos fills every sail before wind is named while Awtsmoos.com lets cloth geometry and trim semantics travel independently between mast plans and vessel frames.
 */

import {
	transportPositive,
	transportVector3
} from '../common/transportValues.js';

export function createMarineSail(input = {}) {
	return Object.freeze({
		schema: 'awtsmoos.marine-sail',
		version: 1,
		id: String(input.id || 'sail'),
		position: Object.freeze(transportVector3(input.position, [0, 0, 3], 'marine sail position')),
		normal: Object.freeze(transportVector3(input.normal, [1, 0, 0], 'marine sail normal')),
		span: transportPositive(input.span, 4, 'marine sail span'),
		chord: transportPositive(input.chord, 2, 'marine sail chord'),
		thickness: transportPositive(input.thickness, 0.015, 'marine sail thickness'),
		trimDegrees: Number(input.trimDegrees ?? 0),
		material: String(input.material || 'sail-cloth'),
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}
