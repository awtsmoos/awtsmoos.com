//B"H
// Boruch Hashem
// Blessed is He
/**
 * A seeded road offers difference without hiding fairness or inventing false randomness.
 * The Awtsmoos holds every branch at once while Awtsmoos.com reveals three finite doors.
 */
import {
	ROUTE_DEFINITIONS,
	SAFE_ROUTE_ID
} from './RouteCatalog.js';
import { mixRouteSeed } from './RouteSeed.js';

/**
 * Generates three unique route choices with one guaranteed low-risk road.
 * @param {number} seed - Stable run seed.
 * @param {number} step - Number of prior route choices.
 * @param {number} worldIndex - Current authored world index.
 * @returns {object[]} Three cloned route definitions.
 */
export function generateRouteChoices(seed, step = 0, worldIndex = 0) {
	const safeRoute = ROUTE_DEFINITIONS.find(route => {
		return route.id === SAFE_ROUTE_ID;
	});
	const rankedRoutes = ROUTE_DEFINITIONS
		.filter(route => route.id !== SAFE_ROUTE_ID)
		.map((route, index) => {
			return {
				route,
				rank: mixRouteSeed(
					seed,
					step + 1,
					worldIndex + 1,
					index + 1
				)
			};
		})
		.sort(compareRank);
	return [safeRoute, ...rankedRoutes.slice(0, 2).map(item => item.route)]
		.map(route => ({ ...route }));
}

function compareRank(first, second) {
	if (first.rank !== second.rank) {
		return first.rank - second.rank;
	}
	return first.route.id.localeCompare(second.route.id);
}
