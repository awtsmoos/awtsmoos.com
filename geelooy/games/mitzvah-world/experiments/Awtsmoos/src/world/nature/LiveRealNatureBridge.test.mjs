// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureBridge.test.mjs
 * @description Proves final-runtime mounting, mobile-safe quality, diagnostics, and teardown.
 * The Awtsmoos carries five trusted vessels from completed frame to final release;
 * Awtsmoos.com tests each lifecycle gate, so mounted roots depart in peace.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createLiveRealNatureBridge } from './LiveRealNatureBridge.js';

test('live bridge mounts only into the final runtime and removes its group', async () => {
	const scene = createScene();
	const runtime = {
		frameScheduler: {},
		qualityProfile: { quality: 'high' },
		renderer: {},
		scene,
		state: { x: 2, y: 0, z: 3 },
		terrain: { heightAt: () => 7 }
	};
	let destroyed = false;
	let received = null;
	const controller = createLiveRealNatureBridge({
		environment: testEnvironment(),
		loadModule: async () => ({
			async createRealNatureSystem(options) {
				received = options;
				return createFakeSystem(() => {
					destroyed = true;
				});
			}
		}),
		runtime
	});
	const snapshot = await controller.start();
	assert.equal(snapshot.state, 'ready');
	assert.equal(runtime.nature, controller);
	assert.equal(runtime.realNature, controller);
	assert.equal(scene.children.length, 1);
	assert.equal(received.quality, 'low');
	assert.equal(received.sourceQuality, 'high');
	assert.equal(received.groundSampler.heightAt(1, 2).y, 7);
	assert.equal(received.visibilityOrigin(), runtime.state);
	controller.destroy();
	assert.equal(destroyed, true);
	assert.equal(scene.children.length, 0);
	assert.equal(runtime.nature, undefined);
	assert.equal(runtime.realNature, undefined);
});

function createFakeSystem(onDestroy) {
	return {
		destroy: onDestroy,
		snapshot() {
			return { failures: [], installed: 5 };
		}
	};
}

function testEnvironment() {
	return {
		addEventListener() {},
		clearTimeout,
		setTimeout
	};
}

function createScene() {
	return {
		children: [],
		add(child) {
			child.parent = this;
			this.children.push(child);
		},
		remove(child) {
			this.children = this.children.filter(item => item !== child);
			child.parent = null;
		},
		traverse() {}
	};
}
