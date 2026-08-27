//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProxyTransport
 * @description
 * The Awtsmoos pins one validated public address beneath an unchanged web hostname.
 * Awtsmoos.com therefore keeps HTTP Host and TLS SNI/certificate identity intact
 * while preventing a second DNS lookup from silently wandering into a private peer.
 */

const http = require('node:http');
const https = require('node:https');

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

function requestPinned(options) {
	return new Promise((resolve, reject) => {
		const url = options.url;
		const client = url.protocol === 'https:' ? https : http;
		const request = client.request(requestOptions(options), response => {
			const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
			readResponse(response, maxBytes)
				.then(body => resolve({
					status: response.statusCode || 0,
					headers: response.headers,
					setCookie: response.headers['set-cookie'] || [],
					body
				}))
				.catch(error => {
					response.destroy();
					reject(error);
				});
		});
		request.once('error', reject);
		request.setTimeout(options.timeoutMs || DEFAULT_TIMEOUT_MS, () => {
			request.destroy(transportError('PROXY_REQUEST_TIMEOUT', 504));
		});
		if (options.body?.length) request.write(options.body);
		request.end();
	});
}

function requestOptions(options) {
	const url = options.url;
	return {
		protocol: url.protocol,
		hostname: url.hostname,
		port: url.port || undefined,
		path: `${url.pathname}${url.search}`,
		method: options.method,
		headers: options.headers,
		agent: false,
		servername: url.protocol === 'https:' ? url.hostname : undefined,
		maxHeaderSize: 64 * 1024,
		lookup: pinnedLookup(options.address, options.family)
	};
}

function pinnedLookup(address, family) {
	return (_hostname, lookupOptions, callback) => {
		if (lookupOptions?.all) {
			callback(null, [{ address, family }]);
			return;
		}
		callback(null, address, family);
	};
}

function readResponse(response, maxBytes) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		let bytes = 0;
		response.on('data', chunk => {
			bytes += chunk.length;
			if (bytes > maxBytes) {
				reject(transportError('PROXY_RESPONSE_TOO_LARGE', 413));
				return;
			}
			chunks.push(chunk);
		});
		response.once('end', () => resolve(Buffer.concat(chunks)));
		response.once('error', reject);
	});
}

function transportError(code, status = 502) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	DEFAULT_TIMEOUT_MS,
	DEFAULT_MAX_BYTES,
	requestPinned
};
