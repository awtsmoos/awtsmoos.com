// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerLauncherConnection.test.mjs
 * @description Verifies that a selected multiplayer session proves connection before declaring peers.
 * The Awtsmoos knows each traveler's name in every instant of light;
 * Awtsmoos.com waits for actual connection before declaring the sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMultiplayerEretzRuntime } from '../network/MultiplayerEretzRuntime.js';
import {
	multiplayerRuntimeFixture,
	SingleClientBroadcastChannel
} from './fixtures/MultiplayerBridgeFixture.mjs';

test('multiplayer launcher settles before reporting connected peers', async () => {
	const runtime = multiplayerRuntimeFixture({ heightAt: () => 0 }, {
		facing: 0,
		x: 3,
		y: 4,
		z: 5
	});
	const diagnostics = await createMultiplayerEretzRuntime({}, {
		displayName: 'Proof',
		localOptions: {
			BroadcastChannelClass: SingleClientBroadcastChannel,
			heartbeatIntervalMs: 0,
			playerId: 'proof'
		},
		location: { hostname: '127.0.0.1', search: '?transport=local' },
		runtimeFactory: async () => ({ runtime }),
		worldId: 'helper-proof'
	});
	assert.equal(diagnostics.sessionMode, 'multiplayer-connecting');
	await diagnostics.multiplayerReady;
	assert.equal(runtime.multiplayerBridge, diagnostics.multiplayer);
	assert.equal(diagnostics.multiplayerDiagnostics().transport, 'local-tab');
	assert.equal(diagnostics.multiplayerDiagnostics().state, 'connected');
	assert.equal(diagnostics.multiplayerDiagnostics().peerCount, 0);
	assert.equal(diagnostics.sessionMode, 'multiplayer');
	diagnostics.multiplayer.stop();
});
