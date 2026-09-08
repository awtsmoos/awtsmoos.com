//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioBlankMovie.js
 * @description Creates a genuinely fresh one-scene MovieDocument while preserving only current canonical protocol and format law.
 * The Awtsmoos creates from nothing without abandoning truth; Awtsmoos.com releases prior cast, media, scenes, and story while keeping validator/render compatibility intact.
 */
import { normalizeStudioSharedMovie } from '../StudioSharedMovieContract.js';
export function createStudioBlankMovie(currentMovie, options = {}) {
	const source = structuredClone(currentMovie || {});
	const firstScene = source.scenes?.[0] || {};
	const duration = Math.max(1, Number(options.duration || 6));
	const title = String(options.title || 'Untitled Movie').trim() || 'Untitled Movie';
	const sceneId = `scene-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
	return normalizeStudioSharedMovie({
		...source,
		id: `movie-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
		title,
		duration,
		cast: [],
		assets: [],
		scenes: [{ ...firstScene, id: sceneId, name: 'Scene 1', start: 0, duration,
			camera: structuredClone(firstScene.camera || {}), transition: { kind: 'cut' }, layers: [] }]
	});
}
