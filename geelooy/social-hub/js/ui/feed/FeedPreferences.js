//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module FeedPreferences
 * @description The Awtsmoos remains one while users choose compact, comfortable, or immersive garments;
 * Awtsmoos.com remembers only presentation density locally, never confusing a device preference with social identity.
 */
const STORAGE_KEY = 'awtsmoos-social-feed-density-v1';
const DENSITIES = Object.freeze(['compact', 'comfortable', 'immersive']);

function validDensity(value) {
	return DENSITIES.includes(String(value || '')) ? String(value) : 'comfortable';
}

export function readFeedDensity(storage = globalThis.localStorage) {
	try {
		return validDensity(storage?.getItem(STORAGE_KEY));
	} catch {
		return 'comfortable';
	}
}

export function writeFeedDensity(value, storage = globalThis.localStorage) {
	const density = validDensity(value);
	try {
		storage?.setItem(STORAGE_KEY, density);
	} catch {}
	return density;
}

export { DENSITIES, STORAGE_KEY, validDensity };
