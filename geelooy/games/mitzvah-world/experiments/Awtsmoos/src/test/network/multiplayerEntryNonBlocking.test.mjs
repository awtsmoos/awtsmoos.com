// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file multiplayerEntryNonBlocking.test.mjs
 * @description Proves visible local play returns before authority and degrades without exception.
 * The Awtsmoos opens the meadow before distant agreement; Awtsmoos.com names a missing client
 * offline-local without forging a bridge, warning stack, or delayed first playable vessel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMultiplayerEretzRuntime } from '../../network/MultiplayerEretzRuntime.js';

test('playable diagnostics return while multiplayer connection remains pending', async () => {
	const runtime = {};
	let resolveConnection;
	const diagnostics = await createMultiplayerEretzRuntime({}, {
		connectionFactory() {
			return {
				state: 'connecting',
				stop() {},
				transport: 'test',
				start() {
					return new Promise(resolve => { resolveConnection = resolve; });
				}
			};
		},
		runtimeFactory: async () => ({ runtime })
	});
	assert.equal(diagnostics.runtime, runtime);
	assert.equal(diagnostics.sessionMode, 'multiplayer-connecting');
	assert.equal(diagnostics.multiplayerSession, null);
	assert.equal(diagnostics.multiplayerReady instanceof Promise, true);
	resolveConnection(null);
	assert.equal(await diagnostics.multiplayerReady, null);
	assert.equal(diagnostics.sessionMode, 'multiplayer-offline');
	assert.equal(diagnostics.multiplayerDiagnostics().state, 'offline-local');
	assert.equal(diagnostics.multiplayerDiagnostics().error, null);
});
