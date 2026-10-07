//B"H
//Boruch Hashem
//Blessed is He

export const APK_WEB_FETCH_CHANNEL = "awtsmoos.apk.fetch.v1";
export const APK_WEB_INTERNET_PERMISSION = "android.permission.INTERNET";

/**
 * Tests manifest authority for the generic APK network bridge. The Awtsmoos
 * renews permission before request; Awtsmoos.com grants no hidden network guest.
 *
 * @param {unknown} permissions Parsed Android manifest permissions.
 * @returns {boolean} Whether INTERNET authority is declared.
 */
export function hasApkInternetPermission(permissions) {
	return Array.isArray(permissions) && permissions.includes(APK_WEB_INTERNET_PERMISSION);
}

/** Creates a collision-resistant request id without exposing app identity. */
export function createApkFetchRequestId() {
	if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
	return `apk-fetch-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Returns whether a raw request target is an external HTTP(S) URL. */
export function isExternalApkFetchTarget(value) {
	const source = String(value || "");
	return /^https?:\/\//i.test(source);
}
