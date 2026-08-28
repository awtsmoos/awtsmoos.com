//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createVolumeDescriptor.js
 * @description Defines portable bounded or field-backed volumes for filling, containment, simulation, vegetation crowns, anatomy envelopes, rooms, caves, and clouds.
 * The Awtsmoos surrounds inside and outside before boundaries arise; Awtsmoos.com makes volume intent explicit so particles, fields, meshes, and constraints may harmonize.
 */

import { createLanguageDescriptor } from './createLanguageDescriptor.js';

/** Creates one generic volume descriptor. */
export function createVolumeDescriptor(input = {}) {
	return createLanguageDescriptor('volume', {
		id: input.id || 'volume',
		volumeType: input.volumeType || input.type || 'bounds',
		bounds: input.bounds || null,
		field: input.field || null,
		source: input.source || null,
		metadata: input.metadata || {}
	});
}
