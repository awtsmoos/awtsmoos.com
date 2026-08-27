//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProxyUrlPolicy
 * @description
 * The Awtsmoos gives a public web address one measured doorway. Awtsmoos.com
 * accepts only ordinary HTTP(S) website origins, without embedded credentials,
 * fragments, or alternate ports that could turn a browser into a port scanner.
 */

const MAX_URL_LENGTH = 4096;

function normalizeProxyUrl(value, baseUrl) {
	if (typeof value !== 'string' || !value.trim()) {
		throw proxyUrlError('PROXY_URL_REQUIRED');
	}
	if (value.length > MAX_URL_LENGTH) {
		throw proxyUrlError('PROXY_URL_TOO_LONG');
	}
	let url;
	try {
		url = baseUrl ? new URL(value, baseUrl) : new URL(value);
	} catch {
		throw proxyUrlError('PROXY_URL_INVALID');
	}
	if (!['http:', 'https:'].includes(url.protocol)) {
		throw proxyUrlError('PROXY_PROTOCOL_FORBIDDEN');
	}
	if (url.username || url.password) {
		throw proxyUrlError('PROXY_URL_CREDENTIALS_FORBIDDEN');
	}
	assertStandardPort(url);
	url.hash = '';
	return url;
}

function assertStandardPort(url) {
	if (!url.port) return;
	const expected = url.protocol === 'https:' ? '443' : '80';
	if (url.port !== expected) {
		throw proxyUrlError('PROXY_PORT_FORBIDDEN');
	}
}

function proxyUrlError(code) {
	const error = new Error(code);
	error.code = code;
	error.status = 400;
	return error;
}

module.exports = {
	MAX_URL_LENGTH,
	normalizeProxyUrl,
	proxyUrlError
};
