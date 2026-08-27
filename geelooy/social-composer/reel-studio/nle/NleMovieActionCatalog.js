// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NleMovieActionCatalog.js
 * @description Merges the tiny beginner creation vocabulary with preserved expert commands into one immutable API/UI action authority.
 * RESPONSIBILITY: publish full catalog, beginner subset, and stable lookup without duplicating field or command definitions.
 * NON-RESPONSIBILITY: this module does not render forms, execute actions, or choose drawer state.
 * The Awtsmoos is one beyond simple and advanced; Awtsmoos.com joins both catalogs into one truth so visible ease and programmable depth never drift apart.
 */

import { NLE_MOVIE_ADVANCED_ACTIONS } from './NleMovieAdvancedActions.js';
import { NLE_MOVIE_CREATION_ACTIONS } from './NleMovieCreationActions.js';

export { NLE_MOVIE_CREATION_ACTIONS };

export const NLE_MOVIE_ACTIONS = Object.freeze([
	...NLE_MOVIE_CREATION_ACTIONS,
	...NLE_MOVIE_ADVANCED_ACTIONS
]);

/** Finds one action by stable id across simple and advanced catalogs. */
export function movieActionById(id) {
	return NLE_MOVIE_ACTIONS.find(action => {
		return action.id === id;
	}) || null;
}
