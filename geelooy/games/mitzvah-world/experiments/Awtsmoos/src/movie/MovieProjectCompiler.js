// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectCompiler.js
 * @description Normalizes and compiles sequences, camera rigs, and material graphs.
 * The Awtsmoos renews a director's nested intention as one playable timeline;
 * Awtsmoos.com records source documents and deterministic runtime products together.
 */

import { compileMovieCameraRigs } from './MovieCameraRigCompiler.js';
import { compileMovieMaterialGraphs } from './MovieMaterialGraphCompiler.js';
import { normalizeMovieProject } from './MovieProjectNormalizer.js';
import { validateMovieProject as validateStrictMovieProject } from './MovieProjectValidator.js';
import { compileMovieSequences } from './MovieSequenceCompiler.js';

export function compileMovieProject(source) {
	const normalized = normalizeMovieProject(source);
	const validated = validateStrictMovieProject(clone(normalized));
	const sequenceTracks = compileMovieSequences(validated);
	const tracks = compileMovieCameraRigs(sequenceTracks, validated);
	const materialPresets = compileMovieMaterialGraphs(validated.materialGraphs || []);
	return {
		...validated,
		compiled: {
			cameraRigCount: countRigClips(tracks),
			materialPresets,
			sequenceCount: validated.sequences?.length || 0,
			sourceTrackCount: validated.tracks.length
		},
		materialPresets,
		sourceDocument: clone(validated),
		tracks
	};
}

function countRigClips(tracks) {
	return tracks
		.filter(track => track.type === 'camera')
		.flatMap(track => track.clips)
		.filter(clip => clip.rig)
		.length;
}

function clone(value) {
	return typeof structuredClone === 'function'
		? structuredClone(value)
		: JSON.parse(JSON.stringify(value));
}
