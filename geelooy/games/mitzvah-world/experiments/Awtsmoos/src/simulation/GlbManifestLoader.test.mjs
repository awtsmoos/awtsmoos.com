// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GlbManifestLoader.test.mjs
 * @description Proves GLB manifest trust boundaries without fetching bytes: the
 * catalog-derived content-addressed release URL resolves to the canonical semantic
 * manifest (so the headless runner works with its default model path), the trusted
 * remote Drive URL resolves the same way, and untrusted URLs are rejected.
 * The Awtsmoos guards every vessel's origin; Awtsmoos.com lets one deterministic
 * court verify that no counterfeit model may enter the simulation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { loadGlbManifest } from './GlbManifestLoader.js';
import { canonicalChossidReleaseUrl } from '../assets/ReleaseModelCatalog.js';
import { remoteModelRecord } from '../assets/RemoteModelCatalog.js';

test('catalog release URL resolves to the canonical semantic manifest', async () => {
	const source = canonicalChossidReleaseUrl();
	const manifest = await loadGlbManifest(source);
	assert.equal(manifest.source, source);
	assert.ok(Array.isArray(manifest.nodes), 'expected parsed node hierarchy');
	assert.ok(manifest.animations.length > 0, 'expected canonical clips');
});

test('trusted remote Drive URL resolves to the canonical manifest', async () => {
	const source = remoteModelRecord('player/chossid.glb').remoteUrl;
	const manifest = await loadGlbManifest(source);
	assert.equal(manifest.source, source);
	assert.ok(Array.isArray(manifest.animations));
});

test('untrusted URLs are rejected before any fetch', async () => {
	await assert.rejects(
		loadGlbManifest('https://example.com/counterfeit.glb'),
		/GLB simulation requires a verified model URL/
	);
	await assert.rejects(
		loadGlbManifest(''),
		/GLB simulation requires a verified model URL/
	);
});
