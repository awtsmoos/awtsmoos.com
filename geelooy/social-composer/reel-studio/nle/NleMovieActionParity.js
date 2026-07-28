// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleMovieActionParity
 * @description
 * Duplicate IDs, duplicate API names, missing methods, or missing controls are made
 * impossible to ignore before an agent or human entrusts a movie to the editor.
 */

import { NLE_MOVIE_ACTIONS } from './NleMovieActionCatalog.js';

export function validateMovieActionCatalog(actions = NLE_MOVIE_ACTIONS) {
	const ids = new Set();
	const apiNames = new Set();
	for (const action of actions) {
		if (!action.id || !action.apiName || !action.label) throw new Error('Every movie action requires id, apiName, and label.');
		if (ids.has(action.id)) throw new Error(`Duplicate movie action id: ${action.id}`);
		if (apiNames.has(action.apiName)) throw new Error(`Duplicate movie API name: ${action.apiName}`);
		ids.add(action.id);
		apiNames.add(action.apiName);
	}
	return { apiNames: [...apiNames], ids: [...ids], valid: true };
}

export function inspectMovieActionParity(api, root, actions = NLE_MOVIE_ACTIONS) {
	const missingApi = actions.filter(action => typeof api[action.apiName] !== 'function').map(action => action.id);
	const controls = new Set([...root.querySelectorAll('[data-movie-action]')].map(element => element.dataset.movieAction));
	const missingUi = actions.filter(action => !controls.has(action.id)).map(action => action.id);
	const unknownUi = [...controls].filter(id => !actions.some(action => action.id === id));
	return {
		missingApi,
		missingUi,
		unknownUi,
		valid: !missingApi.length && !missingUi.length && !unknownUi.length
	};
}
