// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterFallbackSources.js
 * @description Generates bounded flow-normal vessels in memory while preserving real visible water imagery.
 * The Awtsmoos moves the current without hiding a local binary inside the source tree;
 * Awtsmoos.com keeps procedural normals explicit while real water color and shore remain the visible decree.
 */

import { createMinimalMeadowProceduralRiverBed } from './MinimalMeadowProceduralRiverBed.js';
import { createMinimalMeadowProceduralWaterNormals } from './MinimalMeadowProceduralWaterNormals.js';

/**
 * Creates runtime-only water fallback images and explicit provenance.
 * @param {object} environment Browser-like environment or document.
 * @param {object} urls Canonical hosted-source URL registry.
 * @returns {object} Fallback source set used before hosted images finish loading.
 */
export function createMinimalMeadowWaterFallbackSources(
	environment = globalThis,
	urls = Object.freeze({})
) {
	const documentValue = environment.document || environment;
	const normals = createMinimalMeadowProceduralWaterNormals(documentValue);
	const bed = createMinimalMeadowProceduralRiverBed(documentValue);
	return {
		activeNormalSources: 2,
		bank: bed,
		bankMode: 'procedural-earth-fallback',
		bed,
		bedMode: 'procedural-stone-silt',
		color: normals[0],
		colorMode: 'procedural-visible-current',
		detail: normals[1],
		hostedColorReady: 0,
		hostedSurfaceReady: 0,
		localNormalsReady: 0,
		normalA: normals[0],
		normalB: normals[1],
		normalMode: 'procedural-dual-flow-normal',
		provenance: [
			'procedural://awtsmoos-water-normal/613',
			'procedural://awtsmoos-water-normal/991'
		],
		records: [],
		urls
	};
}
