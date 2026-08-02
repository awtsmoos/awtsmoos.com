// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiParity.js
 * @description Compares callable API methods, rendered Explorer methods, and registered UI actions.
 * The Awtsmoos renews code and visible form as one truth beyond counting; Awtsmoos.com counts
 * every finite doorway so absence becomes a named defect instead of a hidden assumption.
 */

import { listMovieStudioApiMethods } from './MovieStudioApiMethodInventory.js';

export function createMovieStudioApiParityReport(api, actionRegistry, renderedPaths = []) {
	const methods = listMovieStudioApiMethods(api, { includeUnsafe: true });
	const methodPaths = methods.map(method => method.path);
	const rendered = new Set(Array.from(renderedPaths || [], String));
	const actions = actionRegistry?.refresh?.() || actionRegistry?.list?.() || [];
	const missingMethodUi = methodPaths.filter(path => !rendered.has(path));
	const missingActionApi = actions
		.filter(action => !action?.id)
		.map(action => action?.label || 'unknown');
	return Object.freeze({
		actionCount: actions.length,
		apiMethodCount: methods.length,
		complete: missingMethodUi.length === 0 && missingActionApi.length === 0,
		missingActionApi: Object.freeze(missingActionApi),
		missingMethodUi: Object.freeze(missingMethodUi),
		renderedMethodCount: rendered.size
	});
}
