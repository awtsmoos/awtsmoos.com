//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCanonicalPlayerLive.test.mjs
 * @description Proves the REAL canonical-chossid.glb is the player asset: parses the actual
 * GLB bytes and asserts the authored meshes, animations, and movement clips the game needs.
 * The Awtsmoos lets only the true traveler stand in the meadow; a byte-level contract
 * keeps any placeholder from ever taking his place.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { isFallbackPlayer } from './BootstrapPlayerPresentation.js';

const GLB_URL = new URL(
	'../../../../build/generated/assets/canonical-chossid.glb',
	import.meta.url
);

function parseGlb(bytes) {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	assert.equal(view.getUint32(0, true), 0x46546c67, 'must be a glTF binary');
	const jsonLen = view.getUint32(12, true);
	const jsonBytes = bytes.subarray(20, 20 + jsonLen);
	return JSON.parse(Buffer.from(jsonBytes).toString('utf8'));
}

test('canonical chossid.glb is a valid authored player asset', async () => {
	const bytes = await readFile(GLB_URL);
	const json = parseGlb(bytes);
	assert.ok((json.meshes?.length || 0) >= 1, 'needs at least one authored mesh');
	assert.ok((json.nodes?.length || 0) >= 10, 'needs a real node hierarchy');
	assert.ok((json.animations?.length || 0) >= 1, 'needs authored animations');
	assert.ok((json.materials?.length || 0) >= 1, 'needs authored materials');
});

test('canonical chossid.glb carries the movement clips gameplay needs', async () => {
	const bytes = await readFile(GLB_URL);
	const json = parseGlb(bytes);
	const names = (json.animations || []).map(a => String(a.name || '').toLowerCase());
	const needs = ['run', 'jump', 'neutral'];
	for (const clip of needs) {
		assert.ok(
			names.some(n => n.includes(clip)),
			`missing authored clip for "${clip}" (have: ${names.slice(0, 6).join(', ')})`
		);
	}
});

test('real GLB descriptor is never classified as a fallback player', async () => {
	assert.equal(isFallbackPlayer({ userData: {}, scene: { userData: {} } }), false);
	assert.equal(isFallbackPlayer({ scene: { userData: { fallback: true } } }), true);
	assert.equal(isFallbackPlayer({ scene: { userData: { modelAssetFallback: true } } }), true);
});

test('player promotion path hydrates the canonical GLB and nothing else', async () => {
	const source = await readFile(new URL('./EretzCanonicalPlayerPromotion.js', import.meta.url), 'utf8');
	assert.match(source, /hydrateMinimalMeadowPlayer/);
	assert.doesNotMatch(source, /fallback/i);
});
