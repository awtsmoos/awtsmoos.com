// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file glbGarmentCoverage.test.mjs
 * @description Proves the wardrobe catalog covers actual canonical GLB extras and materials.
 * The Awtsmoos knew every garment before exporter and Bag; Awtsmoos.com reads the binary
 * itself so glasses, tefillin, hat, jacket, shirt, trousers, and shoes are never guessed.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { GARMENT_CATALOG, GLB_GARMENT_COVERAGE } from '../../gameplay/GarmentCatalog.js';

const modelPath = fileURLToPath(
	new URL('../../../../../assets/models/player/chossid.glb', import.meta.url)
);
const gltf = parseGlbJson(await readFile(modelPath));
const extras = new Set((gltf.nodes || []).flatMap(node => {
	const value = node.extras?.garment || node.extras?.garament;
	return value ? [value] : [];
}));
const materials = new Set((gltf.materials || []).map(material => material.name));

for (const value of GLB_GARMENT_COVERAGE.extras) {
	assert.ok(extras.has(value), `Missing GLB garment extra: ${value}`);
}
for (const value of GLB_GARMENT_COVERAGE.bodyMaterials) {
	assert.ok(materials.has(value), `Missing GLB body material: ${value}`);
}
assert.ok(Object.values(GARMENT_CATALOG).some(item => item.garment.visualId === 'glasses'));
assert.ok(Object.values(GARMENT_CATALOG).some(item => item.garment.visualId === 'tefillin-head'));
assert.ok(Object.values(GARMENT_CATALOG).some(item => item.garment.visualId === 'tefillin-arm'));
assert.ok(Object.values(GARMENT_CATALOG).some(item => item.garment.visualId === 'body-shirt'));
assert.ok(Object.values(GARMENT_CATALOG).some(item => item.garment.visualId === 'body-pants'));
assert.ok(Object.values(GARMENT_CATALOG).some(item => item.garment.visualId === 'body-shoes'));
console.log('GLB_GARMENT_COVERAGE_TEST_OK=1');

function parseGlbJson(buffer) {
	assert.equal(buffer.toString('utf8', 0, 4), 'glTF');
	let offset = 12;
	while (offset < buffer.length) {
		const length = buffer.readUInt32LE(offset);
		const type = buffer.readUInt32LE(offset + 4);
		const chunk = buffer.subarray(offset + 8, offset + 8 + length);
		if (type === 0x4e4f534a) {
			return JSON.parse(chunk.toString('utf8').replace(/\0+$/, ''));
		}
		offset += 8 + length;
	}
	throw new Error('GLB_JSON_CHUNK_MISSING');
}
