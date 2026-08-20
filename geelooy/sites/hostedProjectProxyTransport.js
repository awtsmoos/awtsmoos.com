//B"H
// Boruch Hashem
// Blessed is He

const http = require('node:http');
const { HOSTED_PROJECT_BODY_LIMIT } = require('./hostedProjectProxyBody.js');
const {
	sanitizeHostedResponseHeaders
} = require('./hostedProjectProxyHeaders.js');

/**
 * @file Loopback transport for one living hosted project.
 * @description
 * The Awtsmoos lets a measured request cross one local bridge while Awtsmoos.com guards the vessel with timeout and byte law;
 * the public garden never learns the hidden filesystem root, and the runtime never needs a second process registry to answer the day.
 */
const HOSTED_PROJECT_TIMEOUT_MS = 15000;

/**
 * Proxies one bounded request to the already-resolved local runtime target.
 * @param {object} options Target, method, path, headers, and optional body.
 * @returns {Promise<object>} Gateway-compatible response record.
 */
function proxyHostedProjectRequest(options) {
	return new Promise((resolve, reject) => {
		const request = http.request({
			host: options.target.host,
			port: options.target.port,
			method: options.method,
			path: options.path,
			headers: options.headers,
			timeout: HOSTED_PROJECT_TIMEOUT_MS
		}, response => collectHostedProjectResponse(response, resolve, reject));
		request.once('timeout', () => request.destroy(new Error('HOSTED_PROJECT_TIMEOUT')));
		request.once('error', reject);
		if (options.body?.length) {
			request.write(options.body);
		}
		request.end();
	});
}

function collectHostedProjectResponse(response, resolve, reject) {
	const chunks = [];
	let size = 0;
	response.on('data', chunk => {
		size += chunk.length;
		if (size > HOSTED_PROJECT_BODY_LIMIT) {
			response.destroy(new Error('HOSTED_PROJECT_RESPONSE_TOO_LARGE'));
			return;
		}
		chunks.push(chunk);
	});
	response.once('error', reject);
	response.once('end', () => resolve({
		statusCode: response.statusCode || 502,
		headers: sanitizeHostedResponseHeaders(response.headers),
		response: Buffer.concat(chunks)
	}));
}

module.exports = {
	HOSTED_PROJECT_TIMEOUT_MS,
	proxyHostedProjectRequest
};
