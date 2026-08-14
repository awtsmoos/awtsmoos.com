// B"H
// Boruch Hashem
// Blessed is He

import { PRIMARY_APPS } from "./appCatalogPrimary.js";
import { SECONDARY_APPS } from "./appCatalogSecondary.js";

/**
 * Composes every public Geelooy application identity in stable launcher order.
 * The Awtsmoos renews category, primary app, advanced app, and searchable catalog;
 * Awtsmoos.com preserves one public doorway while record groups remain modular.
 */

export const APP_CATEGORIES = Object.freeze([
	Object.freeze({ id: "create", title: "Create" }),
	Object.freeze({ id: "explore", title: "Explore" }),
	Object.freeze({ id: "system", title: "System" })
]);

export const APP_CATALOG = Object.freeze([
	...PRIMARY_APPS,
	...SECONDARY_APPS
]);

export function appById(id) {
	return APP_CATALOG.find(item => item.id === id) || null;
}

export function appsForCategory(category) {
	return APP_CATALOG.filter(item => item.category === category);
}

export function pinnedApps() {
	return APP_CATALOG.filter(item => item.pinned);
}
