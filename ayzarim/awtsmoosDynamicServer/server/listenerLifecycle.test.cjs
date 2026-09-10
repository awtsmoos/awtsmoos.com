//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file listenerLifecycle.test.cjs
 * @description
 * The Awtsmoos proves required HTTP ownership is binary: a fresh port becomes
 * authoritative, while an occupied port rejects startup with stable testimony.
 * Awtsmoos.com never calls a process healthy merely because another process owns it.
 */

const assert = require('node:assert/strict');
const net = require('node:net');
const test = require('node:test');
const {
	getNumberEnv,
	listenRequired
} = require('./listenerLifecycle.js');

/** Closes a test listener only when this process actually owns it. */
function close(server) {
	if (!server.listening) return Promise.resolve();
	return new Promise((resolve, reject) => {
		server.close(error => error ? reject(error) : resolve());
	});
}

/** Starts one disposable listener and returns the kernel-selected TCP port. */
async function occupyPort() {
	const server = net.createServer();
	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, resolve);
	});
	return {
		port: server.address().port,
		server
	};
}

test('required listener owns a free port before startup may continue', async () => {
	const server = net.createServer();
	try {
		assert.equal(await listenRequired(server, 0, 'HTTP'), true);
		assert.equal(server.listening, true);
	} finally {
		await close(server);
	}
});

test('required listener rejects when another process already owns the port', async () => {
	const owner = await occupyPort();
	const contender = net.createServer();
	try {
		await assert.rejects(
			listenRequired(contender, owner.port, 'HTTP'),
			error => {
				assert.equal(error.code, 'AWTSMOOS_REQUIRED_LISTENER_UNAVAILABLE');
				assert.equal(error.port, owner.port);
				assert.equal(error.listenerLabel, 'HTTP');
				return true;
			}
		);
		assert.equal(contender.listening, false);
	} finally {
		await close(contender);
		await close(owner.server);
	}
});

test('positive environment ports win while invalid values retain the fallback', () => {
	assert.equal(getNumberEnv('PORT', 8080, { PORT: '9090' }), 9090);
	assert.equal(getNumberEnv('PORT', 8080, { PORT: '0' }), 8080);
	assert.equal(getNumberEnv('PORT', 8080, { PORT: 'nope' }), 8080);
});
