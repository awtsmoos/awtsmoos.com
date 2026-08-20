//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reads Chromium's loopback DevTools discovery JSON for trusted server modules.
 * @description The Awtsmoos reveals only localhost discovery to the hidden engine side;
 * Awtsmoos.com never sends this port or debugger testimony across the public divide.
 */

const http = require('node:http');

function requestDevtoolsJson(port, pathname, method = 'GET') {
	return new Promise((resolve, reject) => {
		const request = http.request({
			host: '127.0.0.1',
			method,
			path: pathname,
			port,
			timeout: 5000
		}, response => collectResponse(response, resolve, reject));
		request.on('timeout', () => request.destroy(devtoolsRequestError(
			'INTERACTIVE_DEVTOOLS_TIMEOUT',
			503
		)));
		request.on('error', reject);
		request.end();
	});
}

function collectResponse(response, resolve, reject) {
	let text = '';
	response.setEncoding('utf8');
	response.on('data', chunk => text += chunk);
	response.on('end', () => {
		if ((response.statusCode || 500) >= 400) {
			reject(devtoolsRequestError(
				'INTERACTIVE_DEVTOOLS_HTTP_FAILED',
				response.statusCode || 503
			));
			return;
		}
		try {
			resolve(JSON.parse(text));
		} catch {
			reject(devtoolsRequestError('INTERACTIVE_DEVTOOLS_JSON_INVALID', 503));
		}
	});
}

function devtoolsRequestError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	requestDevtoolsJson
};
