//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioBlankMovie.js
 * @description Creates a fresh valid one-scene MovieDocument by preserving the repository's current canonical protocol and format vessels.
 * The Awtsmoos creates from nothing without abandoning truth; Awtsmoos.com likewise begins a new movie from the known canonical law,
 * clearing prior story matter while preserving the versioned format that renderer, validator, save, and export already saw.
 */

import { normalizeStudioSharedMovie } from '../StudioSharedMovieContract.js';

/** Create a fresh canonical movie while preserving current protocol/format compatibility. */
export function createStudioBlankMovie(currentMovie, options = {}) {
	const source = structuredClone(currentMovie || {});
	const firstScene = source.scenes?.[0] || {};
	const duration = Math.max(1, Number(options.duration || 6));
	const title = String(options.title || 'Untitled Movie').trim() || 'Untitled Movie';
	const sceneId = `scene-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	const movie = {
		...source,
		id: `movie-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
		title,
		duration,
		scenes: [{
			...firstScene,
			id: sceneId,
			name: 'Scene 1',
			start: 0,
			duration,
			camera: structuredClone(firstScene.camera || {}),
			transition: { kind: 'cut' },
			layers: []
		}]
	};
	return normalizeStudioSharedMovie(movie);
}
