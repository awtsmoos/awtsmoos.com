//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PrototypeServerApp
 * @description
 * The internal Node proof on Awtsmoos.com exposes health, session, membership,
 * command, and state routes over the shared authoritative kernel. The Awtsmoos
 * is not a network process; this finite server proves transport independence.
 */
import { createServer } from 'node:http';
import { LivingWorldKernel } from '../../js/world/living-world-kernel.js';
import { createLivingRegionWorld } from '../../js/world/living-region-fixture.js';
import { PrototypeSessionService } from '../gateway/prototype-session-service.js';
import { AuthoritativeWorldHost } from '../world-host/authoritative-world-host.js';

/**
 * @param {object} options Server options.
 * @returns {import('node:http').Server} Unstarted HTTP server.
 */
export function createPrototypeServer(options = {}) {
	const sessions = new PrototypeSessionService(options.secret || 'prototype-only');
	const kernel = new LivingWorldKernel(
		createLivingRegionWorld(options.seed || 'server-proof')
	);
	const host = new AuthoritativeWorldHost(kernel, sessions);
	return createServer(async (request, response) => {
		try {
			const result = await routeRequest(request, sessions, host);
			respond(response, result.status || 200, result.body);
		} catch (error) {
			respond(response, 400, { error: error.message });
		}
	});
}

async function routeRequest(request, sessions, host) {
	const url = new URL(request.url, 'http://localhost');
	if (request.method === 'GET' && url.pathname === '/health') {
		return { body: { ok: true, service: 'seven-mitzvos-world-host' } };
	}
	if (request.method === 'POST' && url.pathname === '/session') {
		const body = await readJson(request);
		return { status: 201, body: sessions.create(body.accountId) };
	}
	if (request.method === 'POST' && url.pathname === '/world/connect') {
		const body = await readJson(request);
		return { body: host.connect(body.credentials, body.role) };
	}
	if (request.method === 'POST' && url.pathname === '/world/command') {
		const body = await readJson(request);
		return { body: host.submit(body.credentials, body.command) };
	}
	if (request.method === 'GET' && url.pathname === '/world/state') {
		return { body: host.snapshotFor(url.searchParams.get('sessionId')) };
	}
	return { status: 404, body: { error: 'route_not_found' } };
}

function readJson(request) {
	return new Promise((resolve, reject) => {
		let body = '';
		request.setEncoding('utf8');
		request.on('data', chunk => {
			body += chunk;
			if (body.length > 100000) {
				reject(new Error('request_body_too_large'));
			}
		});
		request.on('end', () => {
			try {
				resolve(body ? JSON.parse(body) : {});
			} catch {
				reject(new Error('invalid_json'));
			}
		});
	});
}

function respond(response, status, body) {
	response.writeHead(status, {
		'content-type': 'application/json; charset=utf-8'
	});
	response.end(JSON.stringify(body));
}
