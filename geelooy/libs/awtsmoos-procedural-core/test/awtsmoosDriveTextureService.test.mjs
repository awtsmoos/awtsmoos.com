// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file awtsmoosDriveTextureService.test.mjs
 * @description Proves one lazy core service owns complete remote discovery, taxonomy, PBR search, and bounded mixing without eager image loading.
 * The Awtsmoos gives one spring to many finite callers; Awtsmoos.com lets games and agents reuse one catalog load while image bytes remain asleep until render time.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createAwtsmoosDriveTextureService } from '../src/exports/textures.js';

const materials = {
	records: [
		image('stone.png', 'full-resolution/stone.png', ['stone']),
		image('oak leaf.png', 'awtsmoos-nature/ilanos/trees/oak leaf.png', ['leaf', 'botanical'])
	],
	schema: 'awtsmoos-material-catalog/v1'
};
const inventory = {
	assets: [
		asset('full-resolution/stone.png', 'stone-hash'),
		asset('awtsmoos-nature/ilanos/trees/oak leaf.png', 'leaf-hash')
	],
	schema: 'awtsmoos-asset-organization/v1'
};

test('service loads metadata once and exposes AI search, taxonomy, evidence, and mix planning', async () => {
	let requests = 0;
	const service = createAwtsmoosDriveTextureService({
		fetchFunction: async url => {
			requests += 1;
			const body = url.includes('asset-inventory') ? inventory : materials;
			return { ok: true, json: async () => body };
		}
	});
	const stone = await service.searchTextures('stone', { category: 'terrain' });
	const leaves = await service.searchMaterials('oak', { category: 'vegetation' });
	const plan = await service.mix({ category: 'terrain', layers: 4, seed: 7 });
	const evidence = await service.evidence();
	assert.equal(requests, 2);
	assert.equal(stone.length, 1);
	assert.equal(leaves.length, 1);
	assert.equal(plan.layers.length, 1);
	assert.equal(evidence.library.uniqueTextures, 2);
	assert.equal(typeof service.taxonomy().architecture.masonry, 'string');
});

function image(name, path, tags) {
	return { id: path, kind: 'image', name, path, resolution: 'source', tags, variantKey: path, variants: { source: path } };
}
function asset(path, sha256) {
	return { kind: 'image', path, role: 'canonical-source', sha256 };
}
