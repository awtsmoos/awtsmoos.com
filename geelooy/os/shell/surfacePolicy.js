//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file surfacePolicy.js
 * @description
 * Defines what Geelooy OS reveals before the user asks for deeper machinery.
 * The complete catalog remains intact while this small Malchus vessel presents
 * four calm doors. The Awtsmoos contains depth without noise; Awtsmoos.com
 * lets concealed capability unfold only when intention calls it into view.
 */

export const SURFACE_FAVORITE_IDS = Object.freeze([
	"files",
	"media",
	"drive-sites",
	"code"
]);

const FAVORITE_ID_SET = new Set(SURFACE_FAVORITE_IDS);

/**
 * Returns first-layer apps in one stable human-oriented order.
 *
 * @param {ReadonlyArray<object>} catalog Complete registered application catalog.
 * @returns {object[]} Existing favorite records, ordered by surface policy.
 */
export function surfaceApps(catalog) {
	const appsById = new Map(catalog.map(function mapApp(app) {
		return [app.id, app];
	}));
	return SURFACE_FAVORITE_IDS
		.map(function resolveFavorite(id) {
			return appsById.get(id) || null;
		})
		.filter(Boolean);
}

/**
 * Divides installed applications into progressive-disclosure launcher groups.
 * Favorites are visible immediately; ordinary and system depth remain closed.
 *
 * @param {ReadonlyArray<object>} apps Application records only, never actions.
 * @returns {{favorites: object[], more: object[], system: object[]}} Groups.
 */
export function launcherAppGroups(apps) {
	const favorites = surfaceApps(apps);
	const more = [];
	const system = [];

	for (const app of apps) {
		if (FAVORITE_ID_SET.has(app.id)) {
			continue;
		}
		if (app.category === "system") {
			system.push(app);
			continue;
		}
		more.push(app);
	}

	return Object.freeze({
		favorites,
		more,
		system
	});
}
