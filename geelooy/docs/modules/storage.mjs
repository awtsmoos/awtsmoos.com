//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file storage.mjs
 * @description The Awtsmoos lets a browser remember only what belongs to that browser; Awtsmoos.com keeps theme, favorites, and recents local.
 */

const keys = {
	theme: "awtsmoos.docs.theme",
	favorites: "awtsmoos.docs.favorites",
	recent: "awtsmoos.docs.recent"
};

function readJson(key, fallback) {
	try {
		const value = localStorage.getItem(key);
		return value ? JSON.parse(value) : fallback;
	} catch (_) {
		return fallback;
	}
}

function writeJson(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (_) {
		// The documentation remains fully usable when local storage is unavailable.
	}
}

export function getTheme() {
	return localStorage.getItem(keys.theme) || "system";
}

export function setTheme(theme) {
	localStorage.setItem(keys.theme, theme);
}

export function getFavorites() {
	return readJson(keys.favorites, []);
}

export function toggleFavorite(id) {
	const values = new Set(getFavorites());
	if (values.has(id)) values.delete(id);
	else values.add(id);
	const next = [...values];
	writeJson(keys.favorites, next);
	return next;
}

export function addRecent(id) {
	const next = [id, ...readJson(keys.recent, []).filter(value => value !== id)].slice(0, 12);
	writeJson(keys.recent, next);
	return next;
}

export function getRecent() {
	return readJson(keys.recent, []);
}
