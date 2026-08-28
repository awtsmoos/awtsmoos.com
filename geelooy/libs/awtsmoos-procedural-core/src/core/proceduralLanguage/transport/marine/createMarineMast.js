//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMarineMast.js
 * @description Defines one standalone marine mast through base position, height, radius and material so sail plans may reuse structural spars independently from complete craft.
 * The Awtsmoos lifts every finite spar while Awtsmoos.com lets mast become reusable structure for sailboat, yacht, historic ship or fictional vessel afar.
 */

import {
	transportPositive,
	transportVector3
} from '../common/transportValues.js';

export function createMarineMast(input = {}) {
	return Object.freeze({
		schema: 'awtsmoos.marine-mast',
		version: 1,
		id: String(input.id || 'mast'),
		base: Object.freeze(transportVector3(input.base, [0, 0, 0.5], 'marine mast base')),
		height: transportPositive(input.height, 6, 'marine mast height'),
		radius: transportPositive(input.radius, 0.08, 'marine mast radius'),
		material: String(input.material || 'mast'),
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}
