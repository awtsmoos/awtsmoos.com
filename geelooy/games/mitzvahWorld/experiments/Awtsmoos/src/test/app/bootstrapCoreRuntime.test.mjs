// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapCoreRuntime.test.mjs
 * @description Proves visible player creation, frame-capped W movement, directional yaw, immediate rendering, and compact staged boot boundaries.
 * The Awtsmoos recreates each footstep rather than granting one impossible half-second leap;
 * Awtsmoos.com tests the same bounded frame rhythm the browser uses, while generated foundation and core garments keep first play cheap.
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

test('W advances across real capped frames and visible yaw follows A/D state', () => {
	const forward = createRuntime({ turn: 0, x: 0, y: -1 });
	const forwardMovement = new BootstrapMovementController(forward);
	for (let frame = 0; frame < 10; frame += 1) forwardMovement.update(0.05);
	assert.ok(forward.state.z > 1.8);
	const left = createRuntime({ turn: 1, x: 0, y: 0 });
	new BootstrapMovementController(left).update(0.05);
	assert.ok(left.state.facing > 0);
	assert.ok(left.model.quaternion.y > 0);
	const right = createRuntime({ turn: -1, x: 0, y: 0 });
	new BootstrapMovementController(right).update(0.05);
	assert.ok(right.state.facing < 0);
	assert.ok(right.model.quaternion.y < 0);
});

test('bootstrap loop establishes camera, renders immediately, and records one frame sample', () => {
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
	assert.equal(runtime.frameCadence.snapshot().samples, 1);
	movement.stop();
});

test('staged runtime crosses generated first-play chunks and defers post-play richness', async () => {
	const staged = await source('EretzStagedRuntime.js');
	const runtime = await source('createEretzRuntime.js');
	assert.match(staged, /mitzvah-world-foundation\.compact\.js/);
	assert.match(staged, /mitzvah-world-core\.compact\.js/);
	assert.doesNotMatch(staged, /EretzCoreRuntimeAssembly\.js/);
	assert.match(runtime, /rendererHydrationPromise/);
	assert.match(runtime, /startPostPlayableStreams/);
	assert.match(runtime, /postPlayablePriorityPromise/);
});
