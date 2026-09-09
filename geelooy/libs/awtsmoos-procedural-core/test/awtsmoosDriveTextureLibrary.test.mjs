// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file awtsmoosDriveTextureLibrary.test.mjs
 * @description Proves the complete Drive compiler collapses aliases by content hash, rewrites stale origins, preserves quality variants, and selects deterministic no-repeat mix pages.
 * The Awtsmoos is One while paths multiply; Awtsmoos.com proves finite aliases do not multiply decoded texture identity or sampler work.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	compileAwtsmoosDriveTextureLibrary,
	createAwtsmoosDriveTextureMixPlan,
	searchAwtsmoosDriveTextureLibrary
} from '../src/exports/textures.js';

const MATERIALS = Object.freeze({
	records: [
		material('stone-source', 'stone.png', 'full-resolution/stone.png', 'source', 'stone', { source: 'full-resolution/stone.png', half: 'half-resolution/stone.png' }),
		material('stone-half', 'stone.png', 'half-resolution/stone.png', 'half', 'stone', { source: 'full-resolution/stone.png', half: 'half-resolution/stone.png' }),
		material('stone-legacy', 'Stone old.png', 'Way/Stone old.png', 'source', 'legacy-stone', { source: 'Way/Stone old.png' }),
		material('wood-source', 'oak.png', 'full-resolution/oak.png', 'source', 'wood', { source: 'full-resolution/oak.png', half: 'half-resolution/oak.png' })
	],
	schema: 'awtsmoos-material-catalog/v1'
});

const INVENTORY = Object.freeze({
	assets: [
		asset('full-resolution/stone.png', 'stone-hash', 'canonical-source'),
		asset('half-resolution/stone.png', 'stone-half-hash', 'derivative'),
		asset('Way/Stone old.png', 'stone-hash', 'legacy', true),
		asset('full-resolution/oak.png', 'wood-hash', 'canonical-source'),
		asset('half-resolution/oak.png', 'wood-half-hash', 'derivative')
	],
	schema: 'awtsmoos-asset-organization/v1'
});

test('hash compiler preserves aliases while exposing one texture per source image', () => {
	const library = compileAwtsmoosDriveTextureLibrary(MATERIALS, INVENTORY);
	assert.equal(library.evidence.physicalImageRecords, 5);
	assert.equal(library.evidence.uniquePhysicalHashes, 4);
	assert.equal(library.evidence.duplicatePhysicalRecords, 1);
	assert.equal(library.evidence.logicalVariantGroups, 3);
	assert.equal(library.evidence.uniqueTextures, 2);
	const [stone] = searchAwtsmoosDriveTextureLibrary(library, 'stone', { tags: ['stone'] });
	assert.equal(stone.sha256, 'stone-hash');
	assert.ok(stone.aliases.includes('Way/Stone old.png'));
	assert.match(stone.transport.source, /^https:\/\/awtsmoos\.com\/sites\/firebase_drive_migration\//);
	assert.equal(stone.transport.source.includes('awtsmoos-docs-base'), false);
});

test('mix plans are deterministic, bounded, unique, and quality aware', () => {
	const library = compileAwtsmoosDriveTextureLibrary(MATERIALS, INVENTORY);
	const first = createAwtsmoosDriveTextureMixPlan(library, { layers: 9, quality: 'low', seed: 73 });
	const second = createAwtsmoosDriveTextureMixPlan(library, { layers: 9, quality: 'low', seed: 73 });
	assert.deepEqual(first, second);
	assert.equal(first.layers.length, 2);
	assert.equal(new Set(first.layers.map(layer => layer.sha256)).size, 2);
	assert.ok(first.layers.every(layer => layer.quality === 'half'));
});

function material(id, name, path, resolution, variantKey, variants) {
	return { alphaCapable: false, bytes: 100, height: 512, id, kind: 'image', name, path, resolution, tags: [variantKey.includes('wood') ? 'wood' : 'stone'], variantKey, variants, width: 512 };
}

function asset(path, sha256, role, legacy = false) {
	return { bytes: 100, kind: 'image', legacy, path, role, sha256 };
}
