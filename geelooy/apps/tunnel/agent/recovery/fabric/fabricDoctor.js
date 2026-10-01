// B"H
'use strict';

const http = require('http');
const { laneIds, lane } = require('./laneCatalog');

/**
 * @file fabricDoctor.js
 * @description Twelve independent heartbeats reveal twelve separate failure
 * domains. A dead sibling is evidence, not permission to declare the rest dead.
 */
function probe(port, timeoutMs = 1000) {
	return new Promise(resolve => {
		const request = http.get({
			host: '127.0.0.1',
			port,
			path: '/health',
			timeout: timeoutMs
		}, response => {
			response.resume();
			response.on('end', () => resolve({
				ok: response.statusCode === 200,
				status: response.statusCode
			}));
		});
		request.on('timeout', () => request.destroy(new Error('timeout')));
		request.on('error', error => resolve({ ok: false, error: error.message }));
	});
}

async function inspectFabric(basePort = null) {
	const ids = laneIds();
	const entries = await Promise.all(ids.map(async (id, index) => [
		id,
		await probe(basePort ? Number(basePort) + index : lane(id).port)
	]));
	return Object.fromEntries(entries);
}

module.exports = { probe, inspectFabric };
