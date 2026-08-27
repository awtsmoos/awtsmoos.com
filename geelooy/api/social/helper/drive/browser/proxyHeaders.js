//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProxyHeaders
 * @description The Awtsmoos lets a remote origin hear only deliberate testimony;
 * Awtsmoos.com may echo a validated local browser voice, while routing authority,
 * session cookies, response cookies, and forbidden headers remain behind the gate.
 */

const { browserProfileHeaders } = require('./proxyBrowserProfile.js');

const ALLOWED_REQUEST = new Set([
	'accept', 'accept-language', 'authorization', 'cache-control', 'content-type',
	'if-modified-since', 'if-none-match', 'range', 'user-agent'
]);

const SAFE_RESPONSE = new Set([
	'accept-ranges', 'cache-control', 'content-disposition', 'content-language',
	'content-length', 'content-range', 'content-type', 'etag', 'expires',
	'last-modified', 'location', 'vary'
]);

function buildProxyRequestHeaders(input = {}, cookieHeader = '', browserProfile = null) {
	const headers = browserProfileHeaders(browserProfile);
	for (const [rawName, rawValue] of Object.entries(input || {})) {
		const name = rawName.toLowerCase();
		if (!ALLOWED_REQUEST.has(name)) continue;
		const value = headerValue(rawValue);
		if (value !== null) headers[name] = value;
	}
	headers['accept-encoding'] = 'identity';
	if (!headers['user-agent']) headers['user-agent'] = 'AwtsmoosBrowser/1.0';
	if (cookieHeader) headers.cookie = cookieHeader;
	return headers;
}

function safeProxyResponseHeaders(input = {}) {
	const headers = {};
	for (const [rawName, rawValue] of Object.entries(input || {})) {
		const name = rawName.toLowerCase();
		if (!SAFE_RESPONSE.has(name)) continue;
		const value = headerValue(rawValue);
		if (value !== null) headers[name] = value;
	}
	return headers;
}

function withoutAuthorization(headers = {}) {
	const next = { ...headers };
	delete next.authorization;
	delete next.Authorization;
	return next;
}

function headerValue(value) {
	if (Array.isArray(value)) value = value.join(', ');
	if (typeof value !== 'string' && typeof value !== 'number') return null;
	const normalized = String(value);
	if (/[\r\n]/.test(normalized)) return null;
	return normalized.slice(0, 8192);
}

module.exports = {
	buildProxyRequestHeaders,
	safeProxyResponseHeaders,
	withoutAuthorization
};
