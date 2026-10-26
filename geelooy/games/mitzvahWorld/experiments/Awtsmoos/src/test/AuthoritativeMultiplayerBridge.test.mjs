// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AuthoritativeMultiplayerBridge.test.mjs
 * @description Proves player transforms and forward/right network input without altering source truth.
 * The Awtsmoos lights each path a living Chossid may tread;
 * Awtsmoos.com sends direction faithfully from feet to world ahead.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	AuthoritativeMultiplayerBridge,
	runtimePlayerSnapshot
} from '../network/AuthoritativeMultiplayerBridge.js';
import { multiplayerRuntimeFixture } from './fixtures/MultiplayerBridgeFixture.mjs';

test('local authority receives exact runtime x/y/z/facing/moving state', async () => {
	let listener = null;
	let sent = null;
	const client = {
		playerId: 'local',
		world: { players: [], revision: 1 },
		async updatePlayerState(value) {
			sent = value;
		},
		onWorld(callback) {
			listener = callback;
			callback(this.world);
			return () => {
				listener = null;
			};
		}
	};
	const runtime = multiplayerRuntimeFixture({ heightAt: () => 12 }, {
		facing: -1.75,
		moving: true,
		x: 17.125,
		y: 8.625,
		z: -44.25
	});
	const bridge = new AuthoritativeMultiplayerBridge({
		client,
		runtime,
		transport: 'local-tab'
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

test('websocket authority normalizes keyboard-forward and right-strafe commands', async () => {
	let sent = null;
	const client = {
		playerId: 'server-player',
		world: { players: [], revision: 2 },
		heartbeat: async () => {},
		input: async (...values) => {
			sent = values;
		},
		onWorld(callback) {
			callback(this.world);
			return () => {};
		}
	};
	const runtime = multiplayerRuntimeFixture({ heightAt: () => 0 }, {
		facing: 1.25
	});
	// Keyboard input.y is backward-positive; input.x is right-positive.
	// Hence x=1, y=-1 means positive network forward and positive strafe.
	runtime.input.axis = () => ({ x: 1, y: -1 });
	const bridge = new AuthoritativeMultiplayerBridge({ client, runtime });
	bridge.start();
	await Promise.resolve();
	assert.deepEqual(
		sent.map(value => Number(value.toFixed(4))),
		[0.7071, 0.7071, 1.25]
	);
	bridge.stop();
});
