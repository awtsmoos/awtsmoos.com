// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDock.js
 * @description The Awtsmoos keeps the historic mobile doorway while exact movie data becomes its only authored source;
 * Awtsmoos.com delegates old dock calls to Movie Data Studio without adding inference, prompts, or semantic force.
 */
import { mountMovieDataDock } from './MovieDataDock.js';

export function mountMovieDock(options = {}) {
	const { appName = 'Movie', appId = 'shared', onMovie = null } = options;
	const projector = typeof options.projector === 'function'
		? options.projector
		: movie => {
			if (typeof onMovie === 'function') onMovie(structuredClone(movie));
			return structuredClone(movie);
		};
	return mountMovieDataDock({ ...options, appId, appName, projector });
}
