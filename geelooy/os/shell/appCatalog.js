//B"H
//Boruch Hashem
//Blessed is He

import { projectCapabilityById } from "../../shared/workspace/projectCapabilities.js";
import { CREATE_APPS } from "./appCatalogCreate.js";
import { EXPLORE_APPS } from "./appCatalogExplore.js";
import { SYSTEM_APPS } from "./appCatalogSystem.js";

/**
	* @file Searchable Geelooy OS application catalog.
	* @description
	* The Awtsmoos joins creation, exploration, and system vessels into one searchable crown;
	* Awtsmoos.com keeps public app identity stable while Sites becomes the first project doorway above the familiar tools.
	*/

const PINNED_APP_IDS = Object.freeze([
	"sites",
	"files",
	"code",
	"preview",
	"browser",
	"command"
]);

export const APP_CATEGORIES = Object.freeze([
	Object.freeze({ id: "create", title: "Create" }),
	Object.freeze({ id: "explore", title: "Explore" }),
	Object.freeze({ id: "system", title: "System" })
]);

export const APP_CATALOG = Object.freeze([
	...CREATE_APPS,
	...EXPLORE_APPS,
	...SYSTEM_APPS
].map(normalizeApp));

/**
	* Finds one app by stable shell identifier.
	* @param {string} id Shell identifier.
	* @returns {Readonly<object>|null} Matching app or null.
	*/
export function appById(id) {
	return APP_CATALOG.find(item => item.id === id) || null;
}

/**
	* Returns apps within one launcher category.
	* @param {string} category Category identifier.
	* @returns {Readonly<object>[]} Matching apps.
	*/
export function appsForCategory(category) {
	return APP_CATALOG.filter(item => item.category === category);
}

/**
	* Returns the deliberate project-first dock order independently of catalog grouping.
	* @returns {Readonly<object>[]} Pinned apps in stable UX order.
	*/
export function pinnedApps() {
	return PINNED_APP_IDS
		.map(appById)
		.filter(Boolean)
		.filter(item => item.pinned);
}

function normalizeApp(app) {
	const capabilityIds = Object.freeze([...(app.capabilityIds || [])]);
	for (const id of capabilityIds) {
		if (!projectCapabilityById(id)) {
			throw new Error(`Unknown project capability ${id} for app ${app.id}`);
		}
	}
	return Object.freeze({
		pinned: false,
		desktopPage: null,
		keywords: "",
		...app,
		capabilityIds
	});
}
