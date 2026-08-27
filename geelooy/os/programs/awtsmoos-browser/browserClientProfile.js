//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserClientProfile
 * @description The Awtsmoos lets the proxy hear a bounded echo of the browser
 * already in the user's hand; Awtsmoos.com carries language and user-agent truth
 * without gathering secret cookies, hardware fingerprints, or hidden light.
 */

const MAX_USER_AGENT = 512;
const MAX_LANGUAGE = 64;
const MAX_LANGUAGES = 8;
const MAX_BRANDS = 8;

export function collectBrowserProfile(navigatorObject = globalThis.navigator) {
	if (!navigatorObject) return null;
	if (navigatorObject === globalThis.navigator && !realBrowserNavigator(navigatorObject)) {
		return null;
	}
	return sanitizeBrowserProfile({
		language: navigatorObject.language,
		languages: navigatorObject.languages,
		mobile: navigatorObject.userAgentData?.mobile,
		platform: navigatorObject.userAgentData?.platform,
		uaBrands: navigatorObject.userAgentData?.brands,
		userAgent: navigatorObject.userAgent
	});
}

export function sanitizeBrowserProfile(input = {}) {
	if (!input || typeof input !== "object") return null;
	const userAgent = cleanText(input.userAgent, MAX_USER_AGENT);
	const languages = cleanLanguages(input.languages, input.language);
	const profile = {};
	if (userAgent) profile.userAgent = userAgent;
	if (languages.length) {
		profile.language = languages[0];
		profile.languages = languages;
	}
	const brands = cleanBrands(input.uaBrands);
	if (brands.length) profile.uaBrands = brands;
	const platform = cleanText(input.platform, MAX_LANGUAGE);
	if (platform) profile.platform = platform;
	if (typeof input.mobile === "boolean") profile.mobile = input.mobile;
	return Object.keys(profile).length ? profile : null;
}

function realBrowserNavigator(navigatorObject) {
	return typeof globalThis.window !== "undefined"
		&& globalThis.window?.navigator === navigatorObject;
}

function cleanLanguages(values, fallback) {
	const candidates = Array.isArray(values) ? values : [fallback];
	const seen = new Set();
	const result = [];
	for (const value of candidates) {
		const language = cleanText(value, MAX_LANGUAGE);
		if (!language) continue;
		const key = language.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		result.push(language);
		if (result.length >= MAX_LANGUAGES) break;
	}
	return result;
}

function cleanBrands(values) {
	if (!Array.isArray(values)) return [];
	const result = [];
	for (const value of values) {
		if (!value || typeof value !== "object") continue;
		const brand = cleanText(value.brand, MAX_LANGUAGE);
		const version = cleanText(value.version, MAX_LANGUAGE);
		if (!brand || !version) continue;
		result.push({ brand, version });
		if (result.length >= MAX_BRANDS) break;
	}
	return result;
}

function cleanText(value, maxLength) {
	if (typeof value !== "string") return "";
	return value
		.replace(/[\u0000-\u001f\u007f]/g, "")
		.trim()
		.slice(0, maxLength);
}
