// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialOriginPolicy.test.js
 * @description Proves production materials use trusted Awtsmoos Drive URLs and no repository image authority.
 * The Awtsmoos lets each distant texture illuminate its appointed surface without entering Git;
 * Awtsmoos.com guards immutable origin, role uniqueness, local rejection, and forbidden-host absence.
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
const DRIVE_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/';
const PROHIBITED = /(firebaseapp\.com|firebasestorage\.googleapis\.com|storage\.googleapis\.com|\.web\.app|local-textures)/i;

test('production material policy accepts trusted Awtsmoos Drive URLs', () => {
	const approved = [
		`${DRIVE_ROOT}full-resolution/weathered%20fieldstone%20Rock%201.png`,
		`${DRIVE_ROOT}full-resolution/shallow%20river%20water.png`
	];
	for (const url of approved) {
		assert.equal(assertProductionMaterialUrl(url), url);
		assert.equal(isSameOriginMaterialUrl(url), true);
	}
	assert.equal(Object.isFrozen(productionMaterialFallbacks(approved, 'test material')), true);
});

test('production material policy rejects local, external, data, and forbidden-host paths', () => {
	const rejected = [
		'./assets/materials/local/world/stone.jpg',
		'/assets/materials/generated/roof.webp',
		'https://example.com/stone.jpg',
		'//example.com/stone.jpg',
		'data:image/png;base64,AA==',
		'https://firebasestorage.googleapis.com/stone.jpg'
	];
	for (const url of rejected) {
		assert.equal(isSameOriginMaterialUrl(url), false, url);
		assert.throws(() => assertProductionMaterialUrl(url), url);
	}
});

test('world texture manifest contains only trusted remote roles', () => {
	assert.ok(WORLD_TEXTURE_MATERIALS.length > 0);
	const roles = new Set();
	for (const material of WORLD_TEXTURE_MATERIALS) {
		assert.equal(assertProductionMaterialUrl(material.primaryUrl), material.primaryUrl);
		assert.equal(material.primaryUrl.startsWith(DRIVE_ROOT), true, material.primaryUrl);
		assert.equal(roles.has(material.role), false, material.role);
		roles.add(material.role);
		for (const fallback of material.fallbackUrls || []) {
			assert.equal(assertProductionMaterialUrl(fallback), fallback);
			assert.equal(fallback.startsWith(DRIVE_ROOT), true, fallback);
		}
	}
});

test('runtime JavaScript contains no forbidden material authority', () => {
	const offenders = [];
	for (const filePath of javascriptFiles(SOURCE_ROOT)) {
		if (PROHIBITED.test(readFileSync(filePath, 'utf8'))) offenders.push(filePath);
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
