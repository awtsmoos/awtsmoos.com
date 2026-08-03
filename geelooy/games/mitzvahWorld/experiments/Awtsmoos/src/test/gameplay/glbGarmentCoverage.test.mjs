// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file glbGarmentCoverage.test.mjs
 * @description Proves immutable Chossid nodes, materials, and gameplay garments cover the live body.
 * The Awtsmoos clothes one person through exact recovered bytes; Awtsmoos.com reads repository truth
 * directly so glasses, tefillin, shirt, pants, shoes, and body materials cannot vanish behind HTTP luck.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { remoteModelRecord } from '../../assets/RemoteModelCatalog.js';
import {
	GARMENT_CATALOG,
	GLB_GARMENT_COVERAGE
} from '../../gameplay/GarmentCatalog.js';

test('the recovered Chossid GLB covers every required garment vessel', async () => {
	const record = remoteModelRecord('player/chossid.glb');
	const gltf = parseGlbJson(await readFile(repositoryModelPath(record)));
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
		assert.ok(Object.values(GARMENT_CATALOG).some(item => {
			return item.garment.visualId === visualId;
		}));
	}
});

function repositoryModelPath(record) {
	const segments = record.path.split('/');
	const filename = segments.pop();
	const folder = segments.join('/');
	const relativePath = `../../../../../assets/models/${folder}/${record.sha256}/${filename}`;
	return fileURLToPath(new URL(relativePath, import.meta.url));
}

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
