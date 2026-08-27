//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Streams ordinary HTTP browser traffic to one policy-approved public peer.
 * @description The Awtsmoos carries each byte through a measured gate;
 * Awtsmoos.com pins the chosen address so rebinding cannot alter fate.
 */

const http = require('node:http');
const { resolveHttpProxyTarget } = require('./interactiveProxyTarget.js');

const MAX_STREAM_BYTES = 25 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30000;

async function handleInteractiveHttpRequest(request, response, options = {}) {
	try {
		const target = await resolveHttpProxyTarget(request, options.resolver);
		const headers = proxyHeaders(request.headers, target.url.host);
		const upstream = http.request({
			family: target.publicTarget.selected.family,
			headers,
			host: target.publicTarget.selected.address,
			method: request.method,
			path: `${target.url.pathname}${target.url.search}`,
			port: 80
		});
		wireRequest(request, response, upstream);
	} catch (error) {
		writeProxyError(response, error);
	}
}

function wireRequest(request, response, upstream) {
	upstream.setTimeout(REQUEST_TIMEOUT_MS, () => upstream.destroy(new Error('INTERACTIVE_PROXY_TIMEOUT')));
	upstream.on('response', incoming => streamResponse(incoming, response));
	upstream.on('error', error => writeProxyError(response, error));
	let sentBytes = 0;
	request.on('data', chunk => {
		sentBytes += chunk.length;
		if (sentBytes > MAX_STREAM_BYTES) {
			upstream.destroy(new Error('INTERACTIVE_PROXY_REQUEST_TOO_LARGE'));
			return;
		}
		upstream.write(chunk);
	});
	request.on('end', () => upstream.end());
	request.on('error', () => upstream.destroy());
}

function streamResponse(incoming, response) {
	response.writeHead(incoming.statusCode || 502, incoming.headers);
	let receivedBytes = 0;
	incoming.on('data', chunk => {
		receivedBytes += chunk.length;
		if (receivedBytes > MAX_STREAM_BYTES) {
			incoming.destroy(new Error('INTERACTIVE_PROXY_RESPONSE_TOO_LARGE'));
			response.destroy();
			return;
		}
		response.write(chunk);
	});
	incoming.on('end', () => response.end());
	incoming.on('error', () => response.destroy());
}

function proxyHeaders(source = {}, host) {
	const headers = { ...source, host };
	delete headers['proxy-authorization'];
	delete headers['proxy-connection'];
	return headers;
}

function writeProxyError(response, error) {
	if (response.headersSent) {
		response.destroy();
		return;
	}
	response.statusCode = Number(error?.status || 502);
	response.end(error?.code || 'INTERACTIVE_PROXY_UPSTREAM_FAILED');
}

module.exports = {
	MAX_STREAM_BYTES,
	handleInteractiveHttpRequest,
	proxyHeaders
};
