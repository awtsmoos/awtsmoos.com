// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureBridge.test.mjs
 * @description Proves terrain adaptation, active runtime mounting, distance culling, and teardown.
 * The Awtsmoos joins measured earth to living form while every distant vessel knows its bound;
 * Awtsmoos.com tests the bridge from first root to final cleanup, leaving no orphan on the ground.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createLiveRealNatureBridge } from './LiveRealNatureBridge.js';
import { createLiveTerrainSampler } from './LiveTerrainSampler.js';
import { NatureVisibilityField } from './NatureVisibilityField.js';

test('live terrain sampler returns height and normalized slope evidence', () => {
	const sampler = createLiveTerrainSampler({
		heightAt(x, z) {
			return x * 0.2 + z * 0.1;
		}
	});
	const sample = sampler.heightAt(4, 3);
	assert.equal(sample.y, 1.1);
	assert.ok(sample.normal.y > 0.95);
	assert.ok(Math.abs(Math.hypot(
		sample.normal.x,
		sample.normal.y,
		sample.normal.z
	) - 1) < 0.000001);
});

test('visibility field hides instances outside the quality budget', () => {
	const origin = { x: 0, z: 0 };
	const instances = [instanceAt(4, 3), instanceAt(30, 0)];
	const field = new NatureVisibilityField(
		instances,
		{ cullDistance: 12 },
		() => origin
	);
	assert.equal(field.update(), 1);
	assert.equal(instances[0].scene.visible, true);
	assert.equal(instances[1].scene.visible, false);
	assert.deepEqual(field.snapshot(), { culled: 1, total: 2, visible: 1 });
	origin.x = 25;
	assert.equal(field.update(), 1);
	assert.equal(instances[0].scene.visible, false);
	assert.equal(instances[1].scene.visible, true);
});

test('live bridge mounts diagnostics and removes its dedicated group', async () => {
	const scene = createScene();
	const runtime = {
		qualityProfile: { quality: 'high' },
		scene,
		state: { playerPosition: { x: 2, y: 0, z: 3 } },
		terrain: { heightAt: () => 7 }
	};
	let destroyed = false;
	let received = null;
	const controller = createLiveRealNatureBridge({
		environment: { addEventListener() {} },
		loadModule: async () => ({
			async createRealNatureSystem(options) {
				received = options;
				return {
					destroy() {
						destroyed = true;
					},
					snapshot() {
						return { failures: [], installed: 5 };
					}
				};
			}
		}),
		runtime
	});
	const snapshot = await controller.start();
	assert.equal(snapshot.state, 'ready');
	assert.equal(runtime.nature, controller);
	assert.equal(runtime.realNature, controller);
	assert.equal(scene.children.length, 1);
	assert.equal(received.quality, 'high');
	assert.equal(received.groundSampler.heightAt(1, 2).y, 7);
	assert.deepEqual(received.visibilityOrigin(), { x: 2, y: 0, z: 3 });
	controller.destroy();
	assert.equal(destroyed, true);
	assert.equal(scene.children.length, 0);
	assert.equal(runtime.nature, undefined);
	assert.equal(runtime.realNature, undefined);
});

function instanceAt(x, z) {
	return {
		placement: { x, z },
		scene: { visible: true }
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
		}
	};
}
