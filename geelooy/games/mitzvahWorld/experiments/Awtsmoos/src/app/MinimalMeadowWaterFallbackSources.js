// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterFallbackSources.js
 * @description Supplies immediate dual-flow shader normals while every visible water, bank, and bed photograph remains honestly remote-pending.
 * The Awtsmoos shapes current without counterfeiting river color; Awtsmoos.com lets two cached tangent fields bend reflected light immediately,
 * while published water, stone, and earth images may enrich the same mounted materials later without delaying play.
 */

import { createMinimalMeadowProceduralWaterNormals } from './MinimalMeadowProceduralWaterNormals.js';

/** Returns remote-pending visible sources plus two deterministic local normal fields. */
export function createMinimalMeadowWaterFallbackSources(
	environment = globalThis,
	urls = Object.freeze({})
) {
	const documentValue = environment.document || environment;
	const normals = createMinimalMeadowProceduralWaterNormals(documentValue);
	return {
		activeNormalSources: 2,
		bank: null,
		bankMode: 'remote-pending',
		bed: null,
		bedMode: 'remote-pending',
		color: null,
		colorMode: 'remote-pending',
		detail: null,
		hostedColorReady: 0,
		hostedSurfaceReady: 0,
		localNormalsReady: 2,
		normalA: normals[0],
		normalB: normals[1],
		normalMode: 'procedural-dual-flow-normal',
		provenance: [
			'procedural://awtsmoos-water-normal/613',
			'procedural://awtsmoos-water-normal/991'
		],
		records: [],
		remoteOnly: false,
		urls
	};
}
