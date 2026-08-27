// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moviePerformanceSelectedMovement.test.mjs
 * @description Proves selected actors receive live control and armed actors retain recording precedence.
 * The Awtsmoos distinguishes selection from arming without severing their shared motion;
 * Awtsmoos.com lets rehearsal move the chosen actor while recording guards its dedicated devotion.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioPerformanceLoop } from '../../movie/MovieStudioPerformanceLoop.js';

function controllerFixture({ armed = null, selected = null } = {}) {
	const calls = [];
	const controller = {
		armedTarget: () => armed,
		cameraRig: {
			update: (...values) => calls.push(['camera', ...values])
		},
		gamepad: { update: () => calls.push(['gamepad']) },
		input: { snapshot: () => ({ forward: 1 }) },
		lastMovement: null,
		movement: {
			update: (...values) => {
				calls.push(['movement', ...values]);
				return { transform: { position: [1, 0, 0] } };
			}
		},
		selectedTarget: () => selected,
		settings: () => ({ camera: {}, cameraMode: 'director' }),
		state: { lastInput: null },
		updateRecording: delta => calls.push(['recording', delta])
	};
	return { calls, controller };
}

test('selected target receives movement before recorder arming', () => {
	const selected = { id: 'selected' };
	const { calls, controller } = controllerFixture({ selected });
	MovieStudioPerformanceLoop.prototype.updateLivePerformance.call(
		{},
		controller,
		0.1
	);
	assert.equal(calls[1][0], 'movement');
	assert.equal(calls[1][1], selected);
	assert.deepEqual(controller.state.lastInput, { forward: 1 });
});

test('armed target takes precedence over selected target', () => {
	const armed = { id: 'armed' };
	const selected = { id: 'selected' };
	const { calls, controller } = controllerFixture({ armed, selected });
	MovieStudioPerformanceLoop.prototype.updateLivePerformance.call(
		{},
		controller,
		0.1
	);
	assert.equal(calls[1][1], armed);
});
