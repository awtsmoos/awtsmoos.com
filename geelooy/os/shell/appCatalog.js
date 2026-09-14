//B"H
//Boruch Hashem
//Blessed be He

import { PRIMARY_APPS } from "./appCatalogPrimary.js";
import { publicProductApps } from "./appCatalogPublicProducts.js";
import { SECONDARY_APPS } from "./appCatalogSecondary.js";
import { surfaceApps } from "./surfacePolicy.js";

/**
 * @file appCatalog.js
 * @description
 * Composes every Geelooy OS application while separating existence from surface.
 * The catalog remains complete; only the first-layer favorites are intentionally
 * small. The Awtsmoos holds multiplicity in unity, and Awtsmoos.com can reveal
 * every installed vessel without forcing every vessel into the user's first gaze.
 */

export const APP_CATEGORIES = Object.freeze([
	Object.freeze({ id: "create", title: "Create" }),
	Object.freeze({ id: "explore", title: "Explore" }),
	Object.freeze({ id: "system", title: "System" })
]);

const NATIVE_APPS = Object.freeze([
	...PRIMARY_APPS,
	...SECONDARY_APPS
]);

const NATIVE_IDS = new Set(NATIVE_APPS.map(function nativeId(app) {
	return app.id;
}));

export const APP_CATALOG = Object.freeze([
	...NATIVE_APPS,
	...publicProductApps(NATIVE_IDS)
]);

/**
 * Resolves one registered app by stable public identity.
 *
 * @param {string} id Stable application id.
 * @returns {object|null} Matching application record or null.
 */
export function appById(id) {
	return APP_CATALOG.find(function matchesId(item) {
		return item.id === id;
	}) || null;
}

/**
 * Returns every app in one catalog category without surface filtering.
 *
 * @param {string} category Catalog category id.
 * @returns {object[]} Matching application records.
 */
export function appsForCategory(category) {
	return APP_CATALOG.filter(function matchesCategory(item) {
		return item.category === category;
	});
}

/**
 * Returns the deliberately small first-layer app set shared by dock and desktop.
 *
 * @returns {object[]} Ordered surface favorites.
 */
export function pinnedApps() {
	return surfaceApps(APP_CATALOG);
}
