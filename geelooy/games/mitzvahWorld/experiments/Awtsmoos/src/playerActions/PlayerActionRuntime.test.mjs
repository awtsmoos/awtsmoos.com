// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerActionRuntime.test.mjs
 * @description Proves the player-action state machine without mounting models:
 * unknown phases and messages are rejected, priority blocks preemption, releases
 * fire exactly once, progress drives timelines, and cancel/complete resolve cleanly.
 * The Awtsmoos joins intention and gesture beneath one law; Awtsmoos.com lets one
 * deterministic court verify that every gesture begins, releases, and returns.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PlayerActionActor } from './PlayerActionActor.js';
import { PlayerActionRegistry } from './PlayerActionRegistry.js';
import { PlayerActionRuntime } from './PlayerActionRuntime.js';

function actionDefinition(overrides = {}) {
	return {
		autoRelease: true,
		duration: 1.0,
		id: 'test.high',
		keyframes: [
			{ at: 0, pose: { rightArm: [0, 0, 0] } },
			{ at: 1, pose: { rightArm: [1, 0, 0] } }
		],
		layer: 'upper-body',
		messageType: 'test.high.msg',
		priority: 55,
		releaseAt: 0.5,
		releaseEvent: 'test.high.release',
		version: 1,
		...overrides
	};
}

function harness(definitions = [actionDefinition()]) {
	const registry = new PlayerActionRegistry(definitions);
	const actor = new PlayerActionActor({
		equipment: { weaponItemId: 'spark-blade' },
		id: 'test-actor',
		model: null
	});
	const events = [];
	const bus = { emit: (type, detail) => events.push([type, detail]) };
	const runtime = new PlayerActionRuntime({ actor, bus, registry });
	return { actor, bus, events, registry, runtime };
}

test('unknown phases and message types are rejected', () => {
	const { runtime } = harness();
	let snapshot = runtime.dispatch({ phase: 'start', type: 'bogus' });
	assert.equal(snapshot.lastResult.result, 'rejected');
	assert.equal(snapshot.lastResult.reason, 'ACTION_MESSAGE_UNKNOWN');
	snapshot = runtime.dispatch({ phase: 'bogus-phase', type: 'test.high.msg' });
	assert.equal(snapshot.lastResult.reason, 'ACTION_PHASE_INVALID');
	assert.equal(runtime.snapshot().activeActionId, null);
});

test('lower priority cannot preempt a running action', () => {
	const low = actionDefinition({ id: 'test.low', messageType: 'test.low.msg', priority: 10, releaseEvent: 'test.low.release' });
	const { runtime } = harness([actionDefinition(), low]);
	runtime.dispatch({ phase: 'start', type: 'test.high.msg' });
	const snapshot = runtime.dispatch({ phase: 'start', type: 'test.low.msg' });
	assert.equal(snapshot.lastResult.reason, 'ACTION_PRIORITY_BLOCKED');
	assert.equal(runtime.snapshot().activeActionId, 'test.high');
});

test('auto-release fires exactly once past releaseAt', () => {
	const { events, runtime } = harness();
	runtime.dispatch({ phase: 'start', type: 'test.high.msg' });
	runtime.update(0.6);
	runtime.update(0.6);
	const releases = events.filter(([type]) => type === 'test.high.release');
	assert.equal(releases.length, 1);
	assert.equal(releases[0][1].actionId, 'test.high');
	assert.equal(releases[0][1].sequence, 1);
});

test('timeline completes into a completed result after recovery', () => {
	const { runtime } = harness();
	runtime.dispatch({ phase: 'start', type: 'test.high.msg' });
	runtime.update(1.2); // timeline complete -> release -> recovering
	assert.equal(runtime.snapshot().phase, 'recovering');
	runtime.update(1.0); // recovery drains -> complete
	const snapshot = runtime.snapshot();
	assert.equal(snapshot.activeActionId, null);
	assert.equal(snapshot.lastResult.result, 'completed');
	assert.equal(snapshot.lastResult.actionId, 'test.high');
});

test('cancel resolves with the given reason and no completion', () => {
	const { runtime } = harness();
	runtime.dispatch({ phase: 'start', type: 'test.high.msg' });
	runtime.dispatch({ phase: 'cancel', reason: 'test-interrupt', type: 'test.high.msg' });
	runtime.update(1.0);
	runtime.update(1.0);
	const snapshot = runtime.snapshot();
	assert.equal(snapshot.activeActionId, null);
	assert.equal(snapshot.lastResult.result, 'cancelled');
	assert.equal(snapshot.lastResult.reason, 'test-interrupt');
});

test('progress messages drive external progress', () => {
	const { runtime } = harness();
	runtime.dispatch({ phase: 'start', type: 'test.high.msg' });
	runtime.dispatch({ phase: 'progress', progress: 0.9, type: 'test.high.msg' });
	runtime.update(0.01);
	assert.ok(runtime.snapshot().progress >= 0.9);
});

test('duplicate ids and message types are refused at registration', () => {
	assert.throws(
		() => new PlayerActionRegistry([actionDefinition(), actionDefinition()]),
		/ACTION_ID_DUPLICATE/
	);
	assert.throws(
		() => new PlayerActionRegistry([
			actionDefinition(),
			actionDefinition({ id: 'test.other' })
		]),
		/ACTION_MESSAGE_DUPLICATE/
	);
});
