//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LivingWorldServerTest
 * @description
 * The dependency-free HTTP proof on Awtsmoos.com starts on an ephemeral port,
 * creates a session, connects a governed member, and accepts a versioned world
 * command through the authoritative host.
 */
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createCommand } from '../js/core/contracts/envelopes.js';
import { createPrototypeServer } from '../server/prototype/server-app.js';

const server = createPrototypeServer({
	secret: 'server-test-secret',
	seed: 'server-test-seed'
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

try {
	const health = await request('/health');
	assert.equal(health.ok, true);

	const credentials = await request('/session', {
		method: 'POST',
		body: { accountId: 'server-governor' }
	});
	const membership = await request('/world/connect', {
		method: 'POST',
		body: { credentials, role: 'governor' }
	});
	assert.equal(membership.role, 'governor');

	const result = await request('/world/command', {
		method: 'POST',
		body: {
			credentials,
			command: createCommand({
				commandId: 'server-command-1',
				type: 'ADVANCE_TIME',
				actorId: credentials.accountId,
				worldId: 'world-seven-mitzvos',
				payload: { minutes: 60 }
			})
		}
	});
	assert.equal(result.state.revision, 1);
	assert.equal(result.events.length, 1);
} finally {
	server.close();
	await once(server, 'close');
}

async function request(path, options = {}) {
	const response = await fetch(`${baseUrl}${path}`, {
		method: options.method || 'GET',
		headers: options.body
			? { 'content-type': 'application/json' }
			: {},
		body: options.body ? JSON.stringify(options.body) : undefined
	});
	const body = await response.json();
	if (!response.ok) {
		throw new Error(body.error || `HTTP ${response.status}`);
	}
	return body;
}

console.log(
	'B"H · Prototype HTTP session, membership, and command routes verified.'
);
