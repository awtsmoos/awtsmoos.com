//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProxyBrowserProfile
 * @description The Awtsmoos receives a bounded echo from the user's local browser;
 * Awtsmoos.com validates that testimony again on the server, allowing language and
 * user-agent garments upstream while refusing arbitrary header authority downstream.
 */

const MAX_USER_AGENT = 512;
const MAX_LANGUAGE = 64;
const MAX_LANGUAGES = 8;

function sanitizeProxyBrowserProfile(input = {}) {
	if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
	const userAgent = cleanText(input.userAgent, MAX_USER_AGENT);
	const languages = cleanLanguages(input.languages, input.language);
	const profile = {};
	if (userAgent) profile.userAgent = userAgent;
	if (languages.length) {
		profile.language = languages[0];
		profile.languages = languages;
	}
	return Object.keys(profile).length ? profile : null;
}

function browserProfileHeaders(input) {
	const profile = sanitizeProxyBrowserProfile(input);
	if (!profile) return {};
	const headers = {};
	if (profile.userAgent) headers['user-agent'] = profile.userAgent;
	if (profile.languages?.length) {
		headers['accept-language'] = acceptLanguage(profile.languages);
	}
	return headers;
}

function cleanLanguages(values, fallback) {
	const candidates = Array.isArray(values) ? values : [fallback];
	const seen = new Set();
	const output = [];
	for (const value of candidates) {
		const language = cleanText(value, MAX_LANGUAGE);
		if (!language) continue;
		const key = language.toLowerCase();
		if (seen.has(key)) continue;
		seen.add(key);
		output.push(language);
		if (output.length >= MAX_LANGUAGES) break;
	}
	return output;
}

function acceptLanguage(languages) {
	return languages.map((language, index) => {
		if (index === 0) return language;
		const quality = Math.max(0.4, 1 - (index * 0.1));
		return `${language};q=${quality.toFixed(1)}`;
	}).join(', ');
}

function cleanText(value, maxLength) {
	if (typeof value !== 'string') return '';
	return value
		.replace(/[\u0000-\u001f\u007f]/g, '')
		.trim()
		.slice(0, maxLength);
}

module.exports = {
	browserProfileHeaders,
	sanitizeProxyBrowserProfile
};
