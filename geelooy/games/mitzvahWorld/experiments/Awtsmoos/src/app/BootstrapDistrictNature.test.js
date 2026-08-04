// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictNature.test.js
 * @description Proves packaged flora augments fallback orchard geometry without becoming fatal.
 * The Awtsmoos lets a real tree enter while the humble cube remains;
 * Awtsmoos.com records both success and mercy when one model fails in the rains.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { hydrateBootstrapDistrictNature } from './BootstrapDistrictNature.js';

test('adds successful flora and records failed siblings', async () => {
	const group = new Group();
	group.userData = {};
	const definition = {
		models: [
			{ modelId: 'tree', position: [1, 2, 3], scale: 2, yaw: 0.5 },
			{ modelId: 'flower', position: [4, 5, 6], scale: 1, yaw: 0 }
		]
	};
	const receipt = await hydrateBootstrapDistrictNature(group, definition, {
		loadIsolatedGltf: async (url, label) => {
			if (label.includes('flower')) throw new Error('flower unavailable');
			const scene = new Group();
			scene.userData = { isolatedModelLoad: { resolvedUrl: url } };
			return { scene };
		},
		worldModelDefinition: modelId => ({ role: 'flora', url: `/models/${modelId}.glb` })
	});
	assert.equal(group.children.length, 1);
	assert.equal(receipt.loaded, 1);
	assert.equal(receipt.failed, 1);
	assert.equal(group.children[0].userData.AwtsmoosBootstrapNature.modelId, 'tree');
});
