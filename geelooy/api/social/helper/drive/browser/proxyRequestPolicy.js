//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProxyRequestPolicy
 * @description
 * The Awtsmoos measures methods and request bodies before network work begins.
 * Awtsmoos.com starts with browser-shaped GET, HEAD, and POST semantics, including
 * the redirect method changes browsers commonly apply to 301/302/303 responses.
 */

const MAX_REQUEST_BYTES = 1024 * 1024;

function normalizeProxyMethod(value) {
	const method = String(value || 'GET').toUpperCase();
	if (!['GET', 'HEAD', 'POST'].includes(method)) {
		throw requestError('PROXY_METHOD_FORBIDDEN', 405);
	}
	return method;
}

function proxyRequestBody(input, method) {
	if (['GET', 'HEAD'].includes(method)) return Buffer.alloc(0);
	let body;
	if (typeof input.body === 'string') body = Buffer.from(input.body);
	else if (typeof input.bodyBase64 === 'string') body = decodeBase64(input.bodyBase64);
	else body = Buffer.alloc(0);
	if (body.length > MAX_REQUEST_BYTES) {
		throw requestError('PROXY_REQUEST_TOO_LARGE', 413);
	}
	return body;
}

function redirectedProxyRequest(method, body, status) {
	if (status === 303 || ((status === 301 || status === 302) && method === 'POST')) {
		return { method: 'GET', body: Buffer.alloc(0) };
	}
	return { method, body };
}

function decodeBase64(value) {
	if (value.length % 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
		throw requestError('PROXY_REQUEST_BASE64_INVALID', 400);
	}
	return Buffer.from(value, 'base64');
}

function requestError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	MAX_REQUEST_BYTES,
	normalizeProxyMethod,
	proxyRequestBody,
	redirectedProxyRequest
};
