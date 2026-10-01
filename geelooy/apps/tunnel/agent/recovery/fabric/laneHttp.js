// B"H
'use strict';

const http = require('http');
const { loadMission } = require('./missionCapsule');
const { saveHandoff, loadLatest, MAXIMUM_BYTES } = require('./handoffEnvelope');

/**
 * @file laneHttp.js
 * @description A tiny rescue door remains when the palace is gone. Health,
 * mission and custody are enough to recognize the situation and continue.
 */
function send(response, status, value) {
	const bytes = Buffer.from(JSON.stringify(value));
	response.writeHead(status, {
		'content-type': 'application/json; charset=utf-8',
		'content-length': bytes.length,
		'cache-control': 'no-store'
	});
	response.end(bytes);
}

async function readJson(request) {
	const chunks = [];
	let total = 0;
	for await (const chunk of request) {
		total += chunk.length;
		if (total > MAXIMUM_BYTES) throw new Error('request_too_large');
		chunks.push(chunk);
	}
	return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

function createLaneServer({ definition, state, policy }) {
	const bornAt = Date.now();
	const server = http.createServer(async (request, response) => {
		try {
			if (request.method === 'GET' && request.url === '/health') return send(response, 200, { ok: true, lane: definition.id, pid: process.pid, uptimeMs: Date.now() - bornAt });
			if (request.method === 'GET' && request.url === '/capabilities') return send(response, 200, { lane: definition.id, capabilities: definition.capabilities });
			if (request.method === 'GET' && request.url === '/mission') {
				try { return send(response, 200, { ok: true, mission: loadMission(state) }); }
				catch (error) { return send(response, 200, { ok: true, missionDegraded: true, error: error.message }); }
			}
			if (request.method === 'GET' && request.url === '/handoff/latest') return send(response, 200, { ok: true, handoff: loadLatest(state) });
			if (request.method === 'POST' && request.url === '/handoff' && policy.allows('handoff')) return send(response, 202, { ok: true, handoff: saveHandoff(state, await readJson(request)) });
			return send(response, 404, { ok: false, error: 'not_found' });
		} catch (error) {
			return send(response, 400, { ok: false, error: String(error.message || error) });
		}
	});
	server.maxConnections = 8192;
	server.requestTimeout = 15000;
	server.headersTimeout = 10000;
	server.keepAliveTimeout = 5000;
	return server;
}

module.exports = { createLaneServer };
