// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { generateWorldAsset, generateWorldAssets, SUPPORTED_TYPES } from '../world/proceduralApi/index.js';

test('generates mesh, terrain, river, well, botanical, and water artifacts from JSON', async () => {
	const recipes = [
		{ id: 'box', type: 'mesh.text', options: { text: 'beveled blue cube 2m' } },
		{ id: 'terrain', type: 'terrain.marching-cubes', options: { field: 'sphere', radius: 2, resolution: [8, 8, 8], size: [6, 6, 6] } },
		{ id: 'river', type: 'environment.river', options: { width: 3, points: [[-4, 0, 0], [0, -0.2, 2], [4, -0.4, 0]] } },
		{ id: 'well', type: 'environment.well', options: { segments: 16 } },
		{ id: 'daisy', type: 'botanical.plant', options: { species: 'daisy', quality: 'low' } },
		{ id: 'water', type: 'material.water', options: { opacity: 0.8 } }
	];
	const assets = await generateWorldAssets(recipes);
	assert.equal(assets.length, recipes.length);
	assert.ok(assets[0].artifact.stats.triangles > 0);
	assert.ok(assets[1].artifact.geometry.stats.triangles > 0);
	assert.equal(assets[2].artifact.parts.length, 2);
	assert.equal(assets[3].artifact.parts.length, 4);
	assert.equal(assets[4].artifact.speciesId, 'daisy');
	assert.match(assets[5].artifact.fragmentShader, /fresnel/i);
	assert.equal(SUPPORTED_TYPES.length, 7);
});

test('rejects unsupported JSON asset recipes', async () => {
	await assert.rejects(() => generateWorldAsset({ id: 'bad', type: 'universe.anything' }), /Unsupported/);
});
