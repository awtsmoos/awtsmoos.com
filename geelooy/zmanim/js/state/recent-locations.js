//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos holds every place at once while human memory benefits from a bounded path;
 * Awtsmoos.com remembers five recent locations without letting local storage become another vast aftermath.
 */

const STORAGE_KEY = "awtsmoos-zmanim-recent-locations-v1";
export const MAX_RECENT_LOCATIONS = 5;

/** Build a stable identity from the coordinates and timezone that actually affect displayed zmanim. */
export function locationIdentity(location) {
	return [
		Number(location.latitude).toFixed(5),
		Number(location.longitude).toFixed(5),
		String(location.timezone || "")
	].join("|");
}

/** Return a newest-first, duplicate-free, bounded recent-location list. */
export function rememberLocation(recentLocations, location, limit = MAX_RECENT_LOCATIONS) {
	const identity = locationIdentity(location);
	const remaining = recentLocations.filter(item => {
		return locationIdentity(item) !== identity;
	});
	return [{ ...location }, ...remaining].slice(0, limit);
}

/** Small persistence vessel that fails closed when browser storage is unavailable. */
export class NetzachRecentLocations {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
	}

	read() {
		try {
			const parsed = JSON.parse(this.storage?.getItem(STORAGE_KEY) || "[]");
			return Array.isArray(parsed) ? parsed.slice(0, MAX_RECENT_LOCATIONS) : [];
		} catch (error) {
			return [];
		}
	}

	remember(location) {
		const recent = rememberLocation(this.read(), location);
		try {
			this.storage?.setItem(STORAGE_KEY, JSON.stringify(recent));
		} catch (error) {
			// Recent places are a convenience, never a prerequisite for calculation.
		}
		return recent;
	}
}
