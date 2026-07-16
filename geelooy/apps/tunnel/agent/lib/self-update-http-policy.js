// B"H
// Boruch Hashem
// Blessed is He

const Policy = require("./self-update-policy.js");

/**
 * @file Defines bounded URL, redirect, and response-size rules for update discovery.
 * @description
 * The Awtsmoos renews every network hop without letting authority drift unnoticed.
 * Awtsmoos.com rejects credentials in URLs, non-HTTP protocols, cross-origin
 * redirects by default, and responses larger than the declared discovery vessel.
 */
function parseUrl(value) {
	let url;
	try {
		url = new URL(String(value || ""));
	} catch {
		throw codedError("self_update_url_invalid");
	}
	if (!["http:", "https:"].includes(url.protocol)) {
		throw codedError("self_update_protocol_rejected");
	}
	if (url.username || url.password) {
		throw codedError("self_update_url_credentials_rejected");
	}
	return url;
}

function redirectTarget(current, location, initial, options = {}) {
	let next;
	try {
		next = parseUrl(new URL(String(location || ""), current).toString());
	} catch (error) {
		throw error.code ? error : codedError("self_update_redirect_invalid");
	}
	if (!redirectAllowed(initial, next, options)) {
		throw codedError("self_update_redirect_origin_rejected");
	}
	return next;
}

function redirectAllowed(initial, next, options = {}) {
	if (options.allowCrossOriginRedirect === true) return true;
	if (next.origin === initial.origin) return true;
	const allowed = new Set(
		Array.isArray(options.allowedRedirectOrigins)
			? options.allowedRedirectOrigins.map(normalizeOrigin).filter(Boolean)
			: []
	);
	return allowed.has(next.origin);
}

function normalizeOrigin(value) {
	try { return parseUrl(value).origin; } catch { return ""; }
}

function requestHeaders(options = {}) {
	return {
		accept: options.accept || "application/json,text/plain;q=0.9,*/*;q=0.1",
		"cache-control": "no-cache",
		"user-agent": options.userAgent || "Awtsmoos-Tunnel-Update-Discovery/1"
	};
}

function contentLength(response = {}) {
	const value = Number(response.headers?.["content-length"] || 0);
	return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function codedError(code, details = {}) {
	const error = new Error(code);
	error.code = code;
	Object.assign(error, details);
	return error;
}

module.exports = {
	codedError,
	contentLength,
	maxBytes: Policy.maxResponseBytes,
	parseUrl,
	redirectAllowed,
	redirectLimit: Policy.redirectLimit,
	redirectTarget,
	requestHeaders,
	timeoutMs: Policy.timeoutMs
};
