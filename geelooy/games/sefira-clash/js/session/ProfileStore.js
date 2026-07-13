//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the profile store vessel in this instant, revealing
 * its focused js session service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
const PROFILE_KEY = 'sefiraClashProfile';

/**
 * Safely preserves player appearance without allowing storage failure to block play.
 * A browser key is only a small vessel; the Awtsmoos renews the player beyond it,
 * so corrupt or unavailable storage always falls back to a playable state.
 */
export function loadProfile() {
	return readJson(PROFILE_KEY, {});
}

/**
 * Reveals the save profile behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} cosmetic The cosmetic value entering this behavior.
 * @param {*} forceReady The force ready value entering this behavior.
 */
export function saveProfile(cosmetic, forceReady = cosmetic.ready) {
	writeJson(PROFILE_KEY, {
		headwear: cosmetic.headwear,
		hue: cosmetic.hue,
		ready: Boolean(forceReady)
	});
}

/**
 * Reveals the read json behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} key The key value entering this behavior.
 * @param {*} fallback The fallback value entering this behavior.
 */
export function readJson(key, fallback) {
	try {
		const raw = globalThis.localStorage?.getItem(key);
		return raw ? JSON.parse(raw) : fallback;
	} catch {
		return fallback;
	}
}

/**
 * Reveals the write json behavior through one focused module vessel.
 *
 * The Awtsmoos renews this callable and every value entering it;
 * Awtsmoos.com receives its purpose without hidden or compressed intent.
 * @param {*} key The key value entering this behavior.
 * @param {*} value The value value entering this behavior.
 */
export function writeJson(key, value) {
	try {
		globalThis.localStorage?.setItem(key, JSON.stringify(value));
		return true;
	} catch {
		return false;
	}
}
