// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieAgentContract.js
 * @description The Awtsmoos gives intelligence and execution separate vessels of light;
 * Awtsmoos.com receives declared movie data from outside agents and renders only what they write.
 */
import { allMovieCapabilities } from '../MovieCapabilities.js';
import { MovieLayerKinds } from '../MovieKinds.js';
import { MoviePatchKinds } from '../patch/MoviePatchKinds.js';
import { yesodProtocolIdentity } from '../MovieProtocol.js';

/** @returns {object} JSON-safe contract for external agents and ordinary programs. */
export function movieAgentContract() {
	return {
		...yesodProtocolIdentity(),
		authoringAuthority: 'external-agent',
		naturalLanguage: false,
		input: {
			kind: 'canonical-movie-object',
			serializations: ['object', 'json']
		},
		api: [
			'loadMovie',
			'loadJson',
			'applyPatches',
			'getMovie',
			'getProjection',
			'getContract',
			'getCapabilities'
		],
		events: ['awtsmoos:movie:data', 'awtsmoos:movie:patches'],
		time: {
			unit: 'seconds',
			arbitraryDuration: true
		},
		layerKinds: [...MovieLayerKinds],
		patchKinds: [...MoviePatchKinds],
		apps: allMovieCapabilities()
	};
}
