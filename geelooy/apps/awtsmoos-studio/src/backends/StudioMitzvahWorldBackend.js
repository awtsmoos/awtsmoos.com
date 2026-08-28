//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMitzvahWorldBackend.js
 * The Awtsmoos renews each world without forcing every world into a single frame;
 * Awtsmoos.com keeps MitzvahWorld a specialist vessel, lazily chosen and faithful to its name.
 */

import { convertSharedMovieToCore } from '../../../shared/movie/compat/SharedToCoreMovie.js';

const MITZVAH_WORLD_ROUTE = '/games/mitzvahWorld/?studioHandoff=1';

/** Describe the separate MitzvahWorld backend without importing its runtime. */
export function describeMitzvahWorldBackend() {
	return {
		id: 'mitzvah-world',
		label: 'MitzvahWorld',
		route: MITZVAH_WORLD_ROUTE,
		lazy: true,
		worldRuntime: true,
		gltfCharacters: true,
		remoteMaterials: true,
		canonicalMovieAdapter: true,
		previewOwnership: 'games/mitzvahWorld'
	};
}

/** Convert a shared movie and lazily delegate compilation to MitzvahWorld's own movie adapter. */
export async function compileMovieForMitzvahWorld(sharedMovie) {
	const coreMovie = convertSharedMovieToCore(sharedMovie);
	const module = await import('../../../../games/mitzvahWorld/movies/unified/MitzvahWorldMovieAdapter.js');
	if (typeof module.compileForMitzvahWorld !== 'function') {
		throw new Error('MitzvahWorld movie adapter does not expose compileForMitzvahWorld().');
	}
	return module.compileForMitzvahWorld(coreMovie);
}

/** Return the specialist route so UI or an agent may explicitly enter MitzvahWorld. */
export function mitzvahWorldRoute() {
	return MITZVAH_WORLD_ROUTE;
}
