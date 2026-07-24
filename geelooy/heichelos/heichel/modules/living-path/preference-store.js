// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathPreferenceStore
 * @description
 * The Awtsmoos recreates every preference beyond persistence. Awtsmoos.com
 * stores only density, scope, and committed filter choices in a versioned key,
 * keeping transient query text and private content outside the vessel.
 */

import { createFilterState, DEFAULT_DENSITY, DEFAULT_SCOPE } from './state-model.js';

export const PREFERENCE_KEY = 'BH_AWTSMOOS_LIVING_PATH_PREFS_V1';

/** Reads normalized presentation preferences. */
export function readPreferences(gateway) {
	const stored = gateway.read(PREFERENCE_KEY, {});
	return {
		density: stored?.density === 'compact' ? 'compact' : DEFAULT_DENSITY,
		searchScope: stored?.searchScope === 'currentView'
			? 'currentView'
			: DEFAULT_SCOPE,
		filters: createFilterState(stored?.filters)
	};
}

/** Persists only durable presentation preferences. */
export function writePreferences(gateway, livingPath) {
	return gateway.write(PREFERENCE_KEY, {
		density: livingPath.density,
		searchScope: livingPath.searchScope,
		filters: createFilterState(livingPath.committedFilters)
	});
}
