//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module BrowserHarnessServerTest
 * @description
 * The Awtsmoos tests the border between a foreign socket and the fixture child our hands truly own;
 * Awtsmoos.com refuses borrowed listeners, then proves its own temporary vessel can rise and peacefully go.
 */

import assert from 'node:assert/strict';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:net';
import test from 'node:test';
import {
	isChildRunning,
	isPortListening,
	startFixtureServer
} from './BrowserHarnessServer.mjs';

const HOST = '127.0.0.1';
const GEELOOY_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

function listenOnRandomPort(server) {
	return new Promise((resolve, reject) => {
		const onError = error => reject(error);
		server.once('error', onError);
		server.listen(0, HOST, () => {
			server.off('error', onError);
			resolve(server.address().port);
		});
	});
}

function closeNodeServer(server) {
	return new Promise(resolve => {
		if (!server.listening) {
			resolve();
			return;
		}
		server.close(() => resolve());
	});
}

async function waitForPortFree(port) {
	for (let attempt = 0; attempt < 50; attempt += 1) {
		if (!await isPortListening(port)) return;
		await new Promise(resolve => setTimeout(resolve, 40));
	}
	throw new Error(`Port ${port} remained occupied after owned fixture shutdown.`);
}

test('fixture ownership rejects foreign listeners and releases owned listeners', async () => {
	const blocker = createServer();
	const port = await listenOnRandomPort(blocker);
	let fixture;
	try {
		await assert.rejects(
			startFixtureServer({ directory: GEELOOY_ROOT, port }),
			/already occupied; refusing foreign listener adoption/
		);
		assert.equal(blocker.listening, true, 'foreign listener must remain untouched');
		await closeNodeServer(blocker);
		fixture = await startFixtureServer({ directory: GEELOOY_ROOT, port });
		const response = await fetch(`${fixture.origin}/games/`);
		assert.equal(response.ok, true, 'owned fixture must serve the Geelooy games directory');
		assert.equal(isChildRunning(fixture.server), true, 'owned child must be alive before shutdown');
		fixture.server.kill('SIGTERM');
		await once(fixture.server, 'exit');
		await waitForPortFree(port);
	} finally {
		await closeNodeServer(blocker);
		if (fixture && isChildRunning(fixture.server)) {
			fixture.server.kill('SIGKILL');
			await once(fixture.server, 'exit');
		}
	}
	assert.equal(await isPortListening(port), false, 'test must leave no fixture listener behind');
});
