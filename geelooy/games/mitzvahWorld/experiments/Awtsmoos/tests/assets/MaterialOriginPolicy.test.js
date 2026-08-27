//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MaterialOriginPolicy.test.js
 * @description Proves that playable materials remain local and the world manifest is import-safe.
 * The Awtsmoos lets every texture illuminate its appointed surface without leaving the village;
 * Awtsmoos.com guards that covenant through deterministic source and runtime evidence.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	assertProductionMaterialUrl,
	isSameOriginMaterialUrl,
	productionMaterialFallbacks
} from '../../src/assets/ProductionMaterialUrlPolicy.js';
import { WORLD_TEXTURE_MATERIALS } from '../../src/assets/WorldTextureManifest.js';

const SOURCE_ROOT = fileURLToPath(new URL('../../src', import.meta.url));
const PROHIBITED_HOST = /(firebaseapp\.com|firebasestorage\.googleapis\.com|storage\.googleapis\.com|\.web\.app)/i;

test('production material policy accepts only approved local paths', () => {
	const approved = [
		'./assets/materials/local/world/stone.jpg',
		'/assets/materials/generated/roof.webp',
		'/geelooy/games/mitzvahWorld/assets/materials/local/world/timber.jpg',
		'/geelooy/games/mitzvahWorld/assets/models/reference-world/flower_4_clump.glb'
	];
	for (const url of approved) {
		assert.equal(assertProductionMaterialUrl(url), url);
		assert.equal(isSameOriginMaterialUrl(url), true);
	}
	const fallbacks = productionMaterialFallbacks(approved.slice(0, 2), 'test material');
	assert.equal(Object.isFrozen(fallbacks), true);
});

test('production material policy rejects remote, traversing, and forbidden paths', () => {
	const rejected = [
		'https://example.com/stone.jpg',
		'//example.com/stone.jpg',
		'data:image/png;base64,AA==',
		'./assets/materials/local/world/../secret.jpg',
		'./assets/materials/local/world/%2e%2e/secret.jpg',
		'./assets/materials/local/half-resolution/stone.jpg',
		'./assets/materials/local/staging/stone.jpg',
		'./images/stone.jpg'
	];
	for (const url of rejected) {
		assert.equal(isSameOriginMaterialUrl(url), false, url);
		assert.throws(() => assertProductionMaterialUrl(url), url);
	}
});

test('world texture manifest imports and contains only local valid roles', () => {
	assert.ok(WORLD_TEXTURE_MATERIALS.length > 0);
	const roles = new Set();
	for (const material of WORLD_TEXTURE_MATERIALS) {
		assert.equal(isSameOriginMaterialUrl(material.primaryUrl), true, material.primaryUrl);
		assert.equal(PROHIBITED_HOST.test(material.primaryUrl), false);
		assert.equal(roles.has(material.role), false, material.role);
		roles.add(material.role);
	}
});

test('runtime JavaScript contains no obsolete external material hosts', () => {
	const offenders = [];
	for (const filePath of javascriptFiles(SOURCE_ROOT)) {
		if (PROHIBITED_HOST.test(readFileSync(filePath, 'utf8'))) offenders.push(filePath);
	}
	assert.deepEqual(offenders, []);
});

function javascriptFiles(directory) {
	const files = [];
	for (const entry of readdirSync(directory, { withFileTypes: true })) {
		const path = `${directory}/${entry.name}`;
		if (entry.isDirectory()) files.push(...javascriptFiles(path));
		if (entry.isFile() && entry.name.endsWith('.js')) files.push(path);
	}
	return files;
}
