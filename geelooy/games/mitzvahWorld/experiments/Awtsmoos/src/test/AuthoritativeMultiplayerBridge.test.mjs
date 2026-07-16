// B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import { AuthoritativeMultiplayerBridge } from '../network/AuthoritativeMultiplayerBridge.js';
import { createMultiplayerEretzRuntime } from '../network/MultiplayerEretzRuntime.js';

test('authoritative bridge receives terrain and publishes normalized live input', async () => {
	let listener = null;
	let sent = null;
	const ground = { heightAt: () => 12 };
	const client = {
		playerId: 'local',
		world: { revision: 1, players: [] },
		heartbeat: async () => {},
		input: async (...values) => { sent = values; },
		onWorld(callback) {
			listener = callback;
			callback(this.world);
			return () => { listener = null; };
		}
	};
	const runtime = {
		constants: { MOVE_SPEED: 4 },
		ground,
		input: { axis: () => ({ x: 1, y: -1 }) },
		joystick: { vector: { x: 0, y: 0, magnitude: 0 } },
		scene: { add() {} },
		state: { facing: 1.25 }
	};
	const bridge = new AuthoritativeMultiplayerBridge({ client, runtime });
	bridge.start();
	assert.equal(bridge.population.ground, ground);
	bridge.sendInput();
	await Promise.resolve();
	assert.deepEqual(sent.map(value => Number(value.toFixed(4))), [0.7071, -0.7071, 1.25]);
	assert.equal(runtime.state.multiplayer.revision, 1);
	bridge.stop();
	assert.equal(listener, null);
});

test('multiplayer launcher helper attaches its live controller to the frame runtime', async () => {
	const runtime = {
		ground: { heightAt: () => 0 },
		input: { axis: () => ({ x: 0, y: 0 }) },
		joystick: { vector: { x: 0, y: 0, magnitude: 0 } },
		scene: { add() {} },
		state: { facing: 0 }
	};
	const diagnostics = await createMultiplayerEretzRuntime({}, {
		displayName: 'Proof',
		location: { hostname: '127.0.0.1', search: '?transport=local' },
		localOptions: { BroadcastChannelClass: FakeBroadcastChannel, playerId: 'proof' },
		runtimeFactory: async () => ({ runtime }),
		worldId: 'helper-proof'
	});
	assert.equal(runtime.multiplayerBridge, diagnostics.multiplayer);
	assert.equal(diagnostics.multiplayerDiagnostics().transport, 'local-tab');
	assert.equal(diagnostics.multiplayerDiagnostics().state, 'connected');
	diagnostics.multiplayer.stop();
});

class FakeBroadcastChannel {
	constructor() {
		this.listeners = new Set();
	}
	addEventListener(type, listener) {
		if (type === 'message') this.listeners.add(listener);
	}
	postMessage() {}
	close() {}
}
