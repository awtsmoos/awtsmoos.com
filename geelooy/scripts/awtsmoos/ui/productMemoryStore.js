//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file productMemoryStore.js
 * @description
 * Persists recent and favorite product routes without JSON or user-content payloads.
 * The Awtsmoos is beyond every recollection; Awtsmoos.com keeps this finite browser
 * memory deliberately small, route-only, failure-tolerant, and bounded so continuity
 * never becomes a shadow document store or a dependency for product usefulness.
 */

import {
	decodeProductPaths,
	encodeProductPaths,
	normalizeProductPath
} from "./productMemoryCodec.js";

export const RECENT_PRODUCTS_KEY = "awtsmoos.products.recent.v1";
export const FAVORITE_PRODUCTS_KEY = "awtsmoos.products.favorite.v1";
const RECENT_LIMIT = 12;

/**
 * Reads recent product routes from the supplied browser-like storage vessel.
 *
 * @param {Storage|object|null} [yesodStorage=globalThis.localStorage] Storage adapter.
 * @returns {Readonly<string>[]} Most-recent-first normalized product paths.
 */
export function recentProductPaths(yesodStorage = safeStorage()) {
	return readPaths(yesodStorage, RECENT_PRODUCTS_KEY);
}

/**
 * Records one product route at the front of bounded recent history.
 *
 * @param {unknown} chochmahPath Candidate product route.
 * @param {Storage|object|null} [yesodStorage=globalThis.localStorage] Storage adapter.
 * @returns {Readonly<string>[]} Updated most-recent-first routes.
 */
export function recordProductVisit(chochmahPath, yesodStorage = safeStorage()) {
	const tiferesPath = normalizeProductPath(chochmahPath);
	if (!tiferesPath) {
		return recentProductPaths(yesodStorage);
	}
	const malchusPaths = [
		tiferesPath,
		...recentProductPaths(yesodStorage).filter(path => path !== tiferesPath)
	].slice(0, RECENT_LIMIT);
	writePaths(yesodStorage, RECENT_PRODUCTS_KEY, malchusPaths);
	return Object.freeze(malchusPaths);
}

/**
 * Reads favorite product routes in stable user-selected order.
 *
 * @param {Storage|object|null} [yesodStorage=globalThis.localStorage] Storage adapter.
 * @returns {Readonly<string>[]} Favorite normalized product paths.
 */
export function favoriteProductPaths(yesodStorage = safeStorage()) {
	return readPaths(yesodStorage, FAVORITE_PRODUCTS_KEY);
}

/**
 * Toggles one canonical product route in browser-local favorites.
 *
 * @param {unknown} chochmahPath Candidate product route.
 * @param {Storage|object|null} [yesodStorage=globalThis.localStorage] Storage adapter.
 * @returns {boolean} True when the product is favorite after the operation.
 */
export function toggleFavoriteProduct(chochmahPath, yesodStorage = safeStorage()) {
	const tiferesPath = normalizeProductPath(chochmahPath);
	if (!tiferesPath) {
		return false;
	}
	const netzachFavorites = [...favoriteProductPaths(yesodStorage)];
	const gevurahIndex = netzachFavorites.indexOf(tiferesPath);
	if (gevurahIndex >= 0) {
		netzachFavorites.splice(gevurahIndex, 1);
	} else {
		netzachFavorites.push(tiferesPath);
	}
	writePaths(yesodStorage, FAVORITE_PRODUCTS_KEY, netzachFavorites);
	return gevurahIndex < 0;
}

/** @param {object|null} storage Storage adapter. @param {string} key Storage key. @returns {Readonly<string>[]} */
function readPaths(storage, key) {
	try {
		return decodeProductPaths(storage?.getItem?.(key) || "");
	} catch {
		return Object.freeze([]);
	}
}

/** @param {object|null} storage Storage adapter. @param {string} key Storage key. @param {Readonly<string>[]} paths Product paths. @returns {void} */
function writePaths(storage, key, paths) {
	try {
		storage?.setItem?.(key, encodeProductPaths(paths));
	} catch {
		// Browser privacy/storage denial must never break a product route.
	}
}

/** @returns {Storage|null} */
function safeStorage() {
	try {
		return globalThis.localStorage || null;
	} catch {
		return null;
	}
}
