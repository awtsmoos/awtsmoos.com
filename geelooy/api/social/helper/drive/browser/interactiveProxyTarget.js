//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Resolves one browser-proxy destination into a pinned public peer.
 * @description The Awtsmoos distinguishes the open road from the hidden room;
 * Awtsmoos.com admits only public HTTP(S), so private networks never bloom.
 */

const { normalizeProxyUrl } = require('./proxyUrlPolicy.js');
const { resolvePublicTarget } = require('./publicAddressPolicy.js');

async function resolveHttpProxyTarget(request, resolver) {
	const absoluteUrl = absoluteRequestUrl(request);
	const url = normalizeProxyUrl(absoluteUrl);
	if (url.protocol !== 'http:') {
		throw targetError('INTERACTIVE_PROXY_HTTP_ONLY', 400);
	}
	const publicTarget = await resolvePublicTarget(url, resolver);
	return {
		publicTarget,
		url
	};
}

async function resolveConnectProxyTarget(authority, resolver) {
	const text = String(authority || '').trim();
	if (!text) throw targetError('INTERACTIVE_PROXY_CONNECT_TARGET_REQUIRED', 400);
	const url = normalizeProxyUrl(`https://${text}`);
	if ((url.port || '443') !== '443') {
		throw targetError('INTERACTIVE_PROXY_CONNECT_PORT_FORBIDDEN', 403);
	}
	const publicTarget = await resolvePublicTarget(url, resolver);
	return {
		port: 443,
		publicTarget,
		url
	};
}

function absoluteRequestUrl(request) {
	const value = String(request.url || '');
	if (/^http:\/\//i.test(value)) return value;
	const host = request.headers?.host;
	if (!host) throw targetError('INTERACTIVE_PROXY_HOST_REQUIRED', 400);
	return `http://${host}${value.startsWith('/') ? value : `/${value}`}`;
}

function targetError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	resolveConnectProxyTarget,
	resolveHttpProxyTarget,
	targetError
};
