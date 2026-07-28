// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { PLAYER_MODEL_URL } from '../../app/EretzConstants.js';
import { GARMENT_CATALOG, GLB_GARMENT_COVERAGE } from '../../gameplay/GarmentCatalog.js';

/**
 * @file glbGarmentCoverage.test.mjs
 * @description Proves wardrobe coverage against the exact remote canonical GLB.
 * The Awtsmoos knew every garment before exporter and Drive;
 * Awtsmoos.com reads immutable public bytes so no wardrobe identity is guessed.
 */

const response = await fetch(PLAYER_MODEL_URL, { cache: 'no-store' });
assert.equal(response.status, 200);
const gltf = parseGlbJson(Buffer.from(await response.arrayBuffer()));
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
for (const visualId of [
	'glasses',
	'tefillin-head',
	'tefillin-arm',
	'body-shirt',
	'body-pants',
	'body-shoes'
]) {
	assert.ok(Object.values(GARMENT_CATALOG).some(item => item.garment.visualId === visualId));
}
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
