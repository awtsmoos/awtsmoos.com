// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapCoreRuntime.test.mjs
 * @description Proves visible player creation, W movement, reversed A/D, and immediate frames.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { BootstrapMovementController } from '../../app/BootstrapMovementController.js';
import { createBootstrapPlayerRuntime } from '../../app/BootstrapPlayerRuntime.js';
import { startBootstrapRuntimeLoop } from '../../app/BootstrapRuntimeLoop.js';

const APP_URL = new URL('../../app/', import.meta.url);
const source = file => readFile(new URL(file, APP_URL), 'utf8');

function createRuntime(axis = { turn: 0, x: 0, y: 0 }) {
	const model = new Group();
	return {
		bootstrapFrames: 0,
		camera: {
			position: { set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
			target: null
		},
		input: { axis: () => ({ ...axis }) },
		joystick: { vector: { magnitude: 0, x: 0, y: 0 } },
		model,
		multiplayerBridge: null,
		renderer: {
			renderCalls: 0,
			render() { this.renderCalls += 1; },
			setInteractor() {}
		},
		scene: {},
		state: {
			facing: 0,
			grounded: true,
			moving: false,
			renderY: 0,
			runMode: false,
			x: 0,
			y: 0,
			z: 0
		}
	};
}

test('player runtime attaches a visible marker to the local model', () => {
	const model = new Group();
	const scene = new Group();
	const runtime = createBootstrapPlayerRuntime({ playerGltf: { scene: model }, scene });
	assert.equal(runtime.model, model);
	assert.equal(runtime.visiblePlayer.children.length, 3);
	assert.equal(model.parent, scene);
});

test('W moves forward and visible yaw follows A/D state', () => {
	const forward = createRuntime({ turn: 0, x: 0, y: -1 });
	new BootstrapMovementController(forward).update(0.5);
	assert.ok(forward.state.z > 2);
	const left = createRuntime({ turn: 1, x: 0, y: 0 });
	new BootstrapMovementController(left).update(0.25);
	assert.ok(left.state.facing > 0);
	assert.ok(left.model.quaternion.y > 0);
	const right = createRuntime({ turn: -1, x: 0, y: 0 });
	new BootstrapMovementController(right).update(0.25);
	assert.ok(right.state.facing < 0);
	assert.ok(right.model.quaternion.y < 0);
});

test('bootstrap loop establishes camera and renders immediately', () => {
	const runtime = createRuntime();
	const frames = [];
	const environment = {
		cancelAnimationFrame() {},
		clearTimeout() {},
		performance: { now: () => 100 },
		requestAnimationFrame(callback) { frames.push(callback); return frames.length; },
		setTimeout() { return 20; }
	};
	const movement = startBootstrapRuntimeLoop(runtime, environment);
	assert.equal(runtime.renderer.renderCalls, 1);
	assert.equal(runtime.camera.position.y, 4.2);
	frames.shift()(116);
	assert.equal(runtime.renderer.renderCalls, 2);
	assert.equal(runtime.bootstrapFrames, 1);
	assert.equal(runtime.frameCadence.snapshot().count, 1);
	movement.stop();
});

test('staged runtime imports bootstrap core and no legacy core assembly', async () => {
	const staged = await source('EretzStagedRuntime.js');
	const runtime = await source('createEretzRuntime.js');
	assert.match(staged, /BootstrapCoreRuntimeAssembly\.js/);
	assert.doesNotMatch(staged, /EretzCoreRuntimeAssembly\.js/);
	assert.doesNotMatch(runtime, /scheduleRendererHydration|EretzDeferredRuntimeEnrichment/);
	assert.match(runtime, /deferredSystems/);
});
