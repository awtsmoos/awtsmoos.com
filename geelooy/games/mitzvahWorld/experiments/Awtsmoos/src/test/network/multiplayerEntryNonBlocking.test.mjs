// B"H
// Boruch Hashem
// Blessed is He

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
	await diagnostics.multiplayerReady;
	assert.equal(diagnostics.sessionMode, 'multiplayer-offline');
});
