// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleMovieActionApi
 * @description
 * Convenience methods are generated directly from the same catalog that generates
 * visible controls; list and invoke remain available for generic agents and tools.
 */

import { cloneNleValue } from './NleClone.js';
import { NLE_MOVIE_ACTIONS } from './NleMovieActionCatalog.js';
import { validateMovieActionCatalog } from './NleMovieActionParity.js';

export function createNleMovieActionApi(executor) {
	validateMovieActionCatalog();
	const api = {
		invoke: (id, values = {}) => executor.invoke(id, values),
		list: () => cloneNleValue(NLE_MOVIE_ACTIONS)
	};
	for (const action of NLE_MOVIE_ACTIONS) {
		api[action.apiName] = (values = {}) => executor.invoke(action.id, values);
	}
	return Object.freeze(api);
}
