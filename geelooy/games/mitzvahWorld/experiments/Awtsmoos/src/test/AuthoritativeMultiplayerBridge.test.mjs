// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AuthoritativeMultiplayerBridge.test.mjs
 * @description Proves exact transform publication, normalized input, and settled launcher authority.
 * The Awtsmoos joins runtime truth with distant forms; Awtsmoos.com waits for the covenant
 * before naming it connected, while first local play remains free to begin beforehand.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	AuthoritativeMultiplayerBridge,
	runtimePlayerSnapshot
} from '../network/AuthoritativeMultiplayerBridge.js';
import { createMultiplayerEretzRuntime } from '../network/MultiplayerEretzRuntime.js';
import {
	multiplayerRuntimeFixture,
	SingleClientBroadcastChannel
} from './fixtures/MultiplayerBridgeFixture.mjs';

test('local authority receives exact runtime x/y/z/facing/moving state', async () => {
	let listener = null;
	let sent = null;
	const client = {
		playerId: 'local',
		world: { players: [], revision: 1 },
		async updatePlayerState(value) { sent = value; },
		onWorld(callback) {
			listener = callback;
			callback(this.world);
			return () => { listener = null; };
		}
	};
	const runtime = multiplayerRuntimeFixture({ heightAt: () => 12 }, {
		facing: -1.75, moving: true, x: 17.125, y: 8.625, z: -44.25
	});
	const bridge = new AuthoritativeMultiplayerBridge({
		client, runtime, transport: 'local-tab'
	});
	bridge.start();
	await Promise.resolve();
	assert.deepEqual(sent, {
		clip: '',
		coordinateSpace: 'world',
		facing: -1.75,
		level: 'eretz',
		moving: true,
		position: { x: 17.125, y: 8.625, z: -44.25 },
		runMode: false
	});
	assert.deepEqual(runtimePlayerSnapshot(runtime).position, sent.position);
	assert.equal(runtime.state.multiplayer.revision, 1);
	bridge.stop();
	assert.equal(listener, null);
});

test('websocket authority retains normalized input commands', async () => {
	let sent = null;
	const client = {
		playerId: 'server-player',
		world: { players: [], revision: 2 },
		heartbeat: async () => {},
		input: async (...values) => { sent = values; },
		onWorld(callback) {
			callback(this.world);
			return () => {};
		}
	};
	const runtime = multiplayerRuntimeFixture({ heightAt: () => 0 }, { facing: 1.25 });
	runtime.input.axis = () => ({ x: 1, y: -1 });
	const bridge = new AuthoritativeMultiplayerBridge({ client, runtime });
	bridge.start();
	await Promise.resolve();
	assert.deepEqual(sent.map(value => Number(value.toFixed(4))), [0.7071, -0.7071, 1.25]);
	bridge.stop();
});

test('multiplayer launcher settles before reporting connected peers', async () => {
	const runtime = multiplayerRuntimeFixture({ heightAt: () => 0 }, {
		facing: 0, x: 3, y: 4, z: 5
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
