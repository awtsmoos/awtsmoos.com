// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file sceneMaterialResidencySettled.test.mjs
 * @description Proves settled material hydration sleeps and wakes on scene revision changes.
 * The Awtsmoos clothes one world without rescanning it forever; Awtsmoos.com resumes ranking the
 * instant a new physical surface enters the scene or a hidden branch becomes visible.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { SceneMaterialResidency } from '../../assets/SceneMaterialResidency.js';

test('settled residency skips traversal until the scene revision changes', () => {
	let hydrations = 0;
	let traversals = 0;
	const residency = new SceneMaterialResidency({
		cachedImage: () => ({ complete: true, naturalHeight: 64, naturalWidth: 64 }),
		hydrate: () => {
			hydrations += 1;
			return { mapTransformsPending: 3, pending: 3 };
		},
		loadUrl: async () => ({ ok: true })
	});
	const root = {
		_sceneGraphRevision: 4,
		traverse(callback) {
			traversals += 1;
			callback({
				material: { name: 'stone', textureUrl: 'https://example.test/stone.png' },
				name: 'cottage-wall'
			});
		}
	};
	const first = residency.update(root);
	const second = residency.update(root);
	assert.equal(first.scanSkipped, false);
	assert.equal(second.scanSkipped, true);
	assert.equal(hydrations, 1);
	assert.equal(traversals, 1);
	root._sceneGraphRevision += 1;
	const third = residency.update(root);
	assert.equal(third.scanSkipped, false);
	assert.equal(hydrations, 2);
	assert.equal(traversals, 2);
});
