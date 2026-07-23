// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapCoreRuntime.test.mjs
 * @description Proves immediate movement, reversed turning, camera, frames, and diagnostics.
 * The Awtsmoos turns intention into place before every rich system; Awtsmoos.com verifies the
 * bootstrap core is playable even when its zero-mesh scene node has no rotation property.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { BootstrapMovementController } from '../../app/BootstrapMovementController.js';
import { createBootstrapPlayerRuntime } from '../../app/BootstrapPlayerRuntime.js';
import { startBootstrapRuntimeLoop } from '../../app/BootstrapRuntimeLoop.js';

const APP_URL = new URL('../../app/', import.meta.url);
const source = file => readFile(new URL(file, APP_URL), 'utf8');

function createRuntime(axis = { turn: 0, x: 0, y: 0 }) {
	const model = {
		position: { set(x, y, z) { this.x = x; this.y = y; this.z = z; } }
	};
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

test('player runtime accepts a zero-mesh scene node with no rotation object', () => {
	const model = {
		name: '',
		parent: null,
		position: { set(x, y, z) { this.x = x; this.y = y; this.z = z; } }
	};
	const scene = { add(value) { value.parent = this; } };
	const runtime = createBootstrapPlayerRuntime({
		playerGltf: { scene: model },
		scene
	});
	assert.equal(runtime.model, model);
	assert.equal(runtime.state.facing, 0);
	assert.equal(model.position.y, 0);
});

test('W intent moves the bootstrap player forward on flat ground', () => {
	const runtime = createRuntime({ turn: 0, x: 0, y: -1 });
	const movement = new BootstrapMovementController(runtime);
	movement.update(0.5);
	assert.equal(runtime.state.x, 0);
	assert.ok(runtime.state.z > 2);
	assert.equal(runtime.state.y, 0);
	assert.equal(runtime.state.moving, true);
});

test('A turns positive and D turns negative without a model rotation field', () => {
	const leftRuntime = createRuntime({ turn: 1, x: 0, y: 0 });
	new BootstrapMovementController(leftRuntime).update(0.25);
	assert.ok(leftRuntime.state.facing > 0);
	const rightRuntime = createRuntime({ turn: -1, x: 0, y: 0 });
	new BootstrapMovementController(rightRuntime).update(0.25);
	assert.ok(rightRuntime.state.facing < 0);
});

test('bootstrap loop renders immediately and advances one scheduled frame', () => {
	const runtime = createRuntime();
	const frames = [];
	const environment = {
		cancelAnimationFrame() {},
		performance: { now: () => 100 },
		requestAnimationFrame(callback) {
			frames.push(callback);
			return frames.length;
		}
	};
	const movement = startBootstrapRuntimeLoop(runtime, environment);
	assert.equal(runtime.renderer.renderCalls, 1);
	frames.shift()(116);
	assert.equal(runtime.renderer.renderCalls, 2);
	assert.equal(runtime.bootstrapFrames, 1);
	assert.equal(runtime.lastFrameError, null);
	movement.stop();
});

test('staged runtime imports bootstrap core and no legacy core assembly', async () => {
	const [staged, runtime] = await Promise.all([
		source('EretzStagedRuntime.js'),
		source('createEretzRuntime.js')
	]);
	assert.match(staged, /BootstrapCoreRuntimeAssembly\.js/);
	assert.doesNotMatch(staged, /EretzCoreRuntimeAssembly\.js/);
	assert.doesNotMatch(runtime, /scheduleRendererHydration|EretzDeferredRuntimeEnrichment/);
	assert.match(runtime, /deferredSystems/);
});
