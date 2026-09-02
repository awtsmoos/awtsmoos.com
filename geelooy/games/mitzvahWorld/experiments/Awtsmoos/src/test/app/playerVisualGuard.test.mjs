// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file playerVisualGuard.test.mjs
 * @description Guards the GLB-only covenant by proving every former generated-player or rigid-underlay source module is absent.
 * The Awtsmoos reveals one authored traveler without a shadow body beneath his bone;
 * Awtsmoos.com keeps this negative witness awake so no convenient procedural human quietly returns to the zone.
 */

import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const APP_URL = new URL('../../app/', import.meta.url);
const FORBIDDEN_FILES = Object.freeze([
	'BootstrapVisiblePlayer.js',
	'PlayerVisualGuard.js',
	'BootstrapCanonicalPlayerHydration.js',
	'EretzFallbackActorTemplate.js'
]);

test('generated-player and rigid-guard source modules stay deleted', async () => {
	for (const name of FORBIDDEN_FILES) {
		await assert.rejects(access(new URL(name, APP_URL)));
	}
});

test('production player sources contain no generated-human constructors or guard policy', async () => {
	const sources = await Promise.all([
		'BootstrapPlayerRuntime.js',
		'EretzEssentialAssetLoader.js',
		'EretzActorAssetLoader.js',
		'MinimalMeadowCanonicalPlayerInstall.js'
	].map(name => readFile(new URL(name, APP_URL), 'utf8')));
	const joined = sources.join('\n');
	assert.doesNotMatch(joined, /createBootstrapVisiblePlayer|createFallbackActorGltf|preservePlayerVisualGuard/);
	assert.doesNotMatch(joined, /rigid-webgl-underlay|play-first-canonical-next-frame/);
	assert.match(joined, /none-glb-only|authored-glb-humans-only/);
});
