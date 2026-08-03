// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealNatureSystem.test.mjs
 * @description Proves bounded isolated models, metadata, partial failure, and cleanup.
 * The Awtsmoos reveals many scenes from trusted forms yet leaves no orphan when they depart;
 * Awtsmoos.com tests every family, shadow truth, culling seal, and failure-contained heart.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createRealNatureSystem } from './RealNatureSystem.js';

const GROUND = Object.freeze({
	heightAt() {
		return { normal: { y: 1 }, y: 2 };
	}
});

test('real nature installs bounded isolated scenes and removes them', async () => {
	const group = createGroup();
	const loadedUrls = [];
	const system = await createRealNatureSystem({
		cancelFrame() {},
		groundSampler: GROUND,
		group,
		loadModel: async url => {
			loadedUrls.push(url);
			return { scene: createScene() };
		},
		quality: 'low',
		requestFrame() {
			return 17;
		}
	});
	const snapshot = system.snapshot();
	assert.equal(snapshot.requested, 7);
	assert.equal(snapshot.installed, 7);
	assert.equal(snapshot.failures.length, 0);
	assert.deepEqual(snapshot.families, { bush: 1, flower: 2, rock: 2, tree: 2 });
	assert.equal(group.children.length, 7);
	assert.equal(loadedUrls.length, 7);
	const evidence = system.instances[0].scene.userData;
	assert.equal(evidence.AwtsmoosNature.visualOnly, true);
	assert.equal(evidence.AwtsmoosShadow.supportedByRenderer, false);
	assert.ok(evidence.AwtsmoosLod.cullDistance > evidence.AwtsmoosLod.fadeStart);
	system.destroy();
	assert.equal(group.children.length, 0);
	assert.equal(system.snapshot().destroyed, true);
});

test('one failed model does not erase successful families', async () => {
	const system = await createRealNatureSystem({
		groundSampler: GROUND,
		group: createGroup(),
		loadModel: async url => {
			if (url.includes('Flower_4_Clump')) throw new Error('flower unavailable');
			return { scene: createScene() };
		},
		quality: 'low',
		requestFrame: null
	});
	const snapshot = system.snapshot();
	assert.equal(snapshot.installed, 5);
	assert.equal(snapshot.failures.length, 2);
	assert.equal(snapshot.families.flower, undefined);
	system.destroy();
});

function createGroup() {
	return {
		children: [],
		add(scene) {
			this.children.push(scene);
		},
		remove(scene) {
			this.children = this.children.filter(child => child !== scene);
		}
	};
}

function createScene() {
	return {
		name: '',
		position: vector(),
		quaternion: quaternion(),
		scale: vector(),
		userData: {},
		traverse(callback) {
			callback(this);
		}
	};
}

function vector() {
	return {
		set(x, y, z) {
			this.x = x;
			this.y = y;
			this.z = z;
		}
	};
}

function quaternion() {
	return {
		set(x, y, z, w) {
			Object.assign(this, { w, x, y, z });
			return this;
		}
	};
}
