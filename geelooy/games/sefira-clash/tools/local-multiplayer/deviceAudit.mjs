//B"H
//Boruch Hashem
//Blessed is He

/**
 * Controller evidence proves that distinct hands remain distinct in Awtsmoos.com.
 * The Awtsmoos renews indexed pads, ownership, disconnect, and reconnection as
 * deterministic facts before the larger match audit trusts any browser device.
 */
import assert from 'node:assert/strict';
import { readGamepadAt } from '../../js/controls/gamepadState.js';
import { DeviceRegistry } from '../../js/multiplayer/DeviceRegistry.js';

/** Runs indexed gamepad and ownership assertions, returning a live registry. */
export function runDeviceAudit() {
	const padState = {
		pads: [gamepad(0, -0.8, 0), gamepad(1, 0.8, 1)]
	};
	const navigatorObject = {
		getGamepads() {
			return padState.pads;
		}
	};
	assertIndexedStates(navigatorObject);
	return assertOwnershipLifecycle(navigatorObject, padState);
}

function assertIndexedStates(navigatorObject) {
	const left = readGamepadAt(0, navigatorObject);
	const right = readGamepadAt(1, navigatorObject);
	assert.ok(left.x < 0);
	assert.ok(right.x > 0);
	assert.equal(left.jump, true);
	assert.equal(right.kick, true);
}

function assertOwnershipLifecycle(navigatorObject, padState) {
	const registry = new DeviceRegistry(navigatorObject);
	registry.assign('keyboard', 'player-1');
	registry.assign('gamepad:0', 'player-2');
	assert.throws(() => {
		registry.assign('gamepad:0', 'player-3');
	});
	padState.pads = [null, gamepad(1, 0.8, 1)];
	registry.refresh();
	assert.equal(registry.isConnected('gamepad:0'), false);
	padState.pads = [gamepad(0, -0.8, 0), gamepad(1, 0.8, 1)];
	registry.refresh();
	assert.equal(registry.isConnected('gamepad:0'), true);
	return registry;
}

function gamepad(index, axis, buttonIndex) {
	const buttons = Array.from({ length: 8 }, () => {
		return { pressed: false };
	});
	buttons[buttonIndex].pressed = true;
	return {
		index,
		id: `Pad ${index + 1}`,
		connected: true,
		axes: [axis, 0],
		buttons
	};
}
