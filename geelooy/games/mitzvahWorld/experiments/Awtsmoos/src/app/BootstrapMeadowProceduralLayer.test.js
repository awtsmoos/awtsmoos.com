// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMeadowProceduralLayer.test.js
 * @description Verifies the meadow procedural layer attaches without a GL context,
 * never throws, and stays idempotent — so boot can never break on vegetation.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	attachMeadowProceduralLayer,
	renderMeadowProceduralLayer,
	disposeMeadowProceduralLayer
} from './BootstrapMeadowProceduralLayer.js';

function stubScene() {
	const added = [];
	return {
		scene: {
			userData: {},
			add(object) {
				added.push(object);
			}
		},
		added
	};
}

test('attach builds grass, trees, and particle fields without GL', () => {
	const { scene, added } = stubScene();
	const layer = attachMeadowProceduralLayer(scene, {
		seed: 'layer-test',
		grassCount: 400,
		fireflyCount: 40,
		sporeCount: 30,
		trees: [
			{ x: -60, z: 40, kind: 'olive' },
			{ x: 60, z: 40, kind: 'oak' }
		]
	});
	assert.ok(layer, 'layer attaches');
	assert.ok(layer.grass.fieldMesh.instanceCount > 0, 'grass field built');
	assert.equal(layer.grass.tints.length, layer.grass.fieldMesh.instanceCount * 3, 'tints match instances');
	assert.equal(layer.trees.length, 2, 'two trees built');
	assert.equal(added.length, 2, 'trees added to scene');
	assert.equal(layer.fields.length, 2, 'firefly + spore fields');
	assert.ok(layer.windController.count >= 2, 'trees registered for wind');
});

test('attach is idempotent per scene and never throws on garbage', () => {
	const { scene } = stubScene();
	const first = attachMeadowProceduralLayer(scene, { seed: 'idem', grassCount: 50, trees: [] });
	const second = attachMeadowProceduralLayer(scene, { seed: 'idem', grassCount: 50, trees: [] });
	assert.equal(first, second, 'same layer returned');
	assert.equal(attachMeadowProceduralLayer(null), null);
	assert.equal(attachMeadowProceduralLayer({}), null);
});

test('render and dispose are safe without GL or layer', () => {
	renderMeadowProceduralLayer(null, null, null, null, null, null);
	disposeMeadowProceduralLayer(null);
	const { scene } = stubScene();
	const layer = attachMeadowProceduralLayer(scene, { seed: 'safe', grassCount: 50, trees: [] });
	renderMeadowProceduralLayer(null, scene, null, null, { timeOfDay: 'night', timeSeconds: 3 }, { draws: 0 });
	disposeMeadowProceduralLayer(scene);
	assert.ok(layer.glFailed, 'failed GL init is recorded, never thrown');
	renderMeadowProceduralLayer(null, scene, null, null, { timeOfDay: 'night', timeSeconds: 4 }, { draws: 0 });
});

test('house clearings stay free of grass', () => {
	const { scene } = stubScene();
	const layer = attachMeadowProceduralLayer(scene, {
		seed: 'clearing',
		grassCount: 3000,
		trees: []
	});
	const offsets = layer.grass.fieldMesh.instanceOffsets;
	let violations = 0;
	for (let index = 0; index < layer.grass.fieldMesh.instanceCount; index += 1) {
		const x = offsets[index * 3];
		const z = offsets[index * 3 + 2];
		for (const [hx, hz] of [[46, -60], [-80, -62]]) {
			const dx = x - hx;
			const dz = z - hz;
			if (dx * dx + dz * dz < 14 * 14) violations += 1;
		}
	}
	assert.equal(violations, 0, 'no grass inside house clearings');
});
