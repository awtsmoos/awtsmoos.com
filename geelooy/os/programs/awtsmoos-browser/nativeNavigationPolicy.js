//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NativeNavigationPolicy
 * @description The Awtsmoos distinguishes an ordinary page-road from a doorway
 * whose identity must remain in the user's real browser; Awtsmoos.com never spoofs
 * a secure user-agent when a genuine top-level vessel is the truthful path.
 */

const NATIVE_IDENTITY_HOSTS = Object.freeze([
	"accounts.google.com",
	"appleid.apple.com",
	"login.live.com",
	"login.microsoftonline.com"
]);

const NATIVE_PATH_RULES = Object.freeze([
	{ host: "github.com", pattern: /^\/login\/oauth(?:\/|$)/i },
	{ host: "www.facebook.com", pattern: /^\/v\d+(?:\.\d+)?\/dialog\/oauth(?:\/|$)/i },
	{ host: "facebook.com", pattern: /^\/v\d+(?:\.\d+)?\/dialog\/oauth(?:\/|$)/i }
]);

const OAUTH_PATH_PATTERN = /\/(?:oauth2?|authorize|authorization|signin|login)(?:\/|$)/i;
const OAUTH_QUERY_KEYS = new Set([
	"client_id",
	"code_challenge",
	"redirect_uri",
	"response_type"
]);

export function classifyNativeNavigation(input, options = {}) {
	const url = normalizeNavigationUrl(input, options.baseUrl);
	if (!url) return decision("blocked", "invalid-url", null);
	if (url.protocol !== "https:" && url.protocol !== "http:") {
		return decision("blocked", "unsupported-scheme", url.href);
	}
	if (options.forceNative === true) {
		return decision("native", "user-selected-native", url.href);
	}
	if (NATIVE_IDENTITY_HOSTS.includes(url.hostname.toLowerCase())) {
		return decision("native", "identity-provider", url.href);
	}
	if (matchesNativePathRule(url)) {
		return decision("native", "identity-provider-oauth", url.href);
	}
	if (looksLikeOAuthAuthorization(url)) {
		return decision("native", "oauth-authorization", url.href);
	}
	return decision("embedded", "ordinary-navigation", url.href);
}

export function normalizeNavigationUrl(input, baseUrl = globalThis.location?.href) {
	try {
		return new URL(String(input || ""), baseUrl || undefined);
	} catch {
		return null;
	}
}

function matchesNativePathRule(url) {
	const host = url.hostname.toLowerCase();
	return NATIVE_PATH_RULES.some(rule => {
		return rule.host === host && rule.pattern.test(url.pathname);
	});
}

function looksLikeOAuthAuthorization(url) {
	if (!OAUTH_PATH_PATTERN.test(url.pathname)) return false;
	let evidence = 0;
	for (const key of OAUTH_QUERY_KEYS) {
		if (url.searchParams.has(key)) evidence += 1;
	}
	return evidence >= 2;
}

function decision(mode, reason, url) {
	return Object.freeze({
		mode,
		reason,
		url
	});
}
