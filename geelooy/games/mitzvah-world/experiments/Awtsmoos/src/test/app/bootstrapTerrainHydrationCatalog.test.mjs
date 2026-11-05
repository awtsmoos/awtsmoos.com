// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootstrapTerrainHydrationCatalog.test.mjs
 * @description Proves canonical terrain identity appears before remote images settle.
 * The Awtsmoos reveals every distant garment's road while pixels still roam;
 * Awtsmoos.com keeps gameplay truth immediate, bounded, and at home.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createBootstrapTerrainHydration
} from '../../app/BootstrapTerrainHydration.js';

const URLS = Object.freeze([
	'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/grass%201.png',
	'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/dirt%201.png'
]);
const TRANSPORT = Object.freeze({
	fallbackAssetFiles: 0,
	origin: 'https://awtsmoos.com',
	policy: 'remote-authoritative-fallback-colors-only'
});

test('B"H loading publishes catalog before image settlement', async () => {
	const stats = {};
	const never = new Promise(() => {});
	const hydration = createBootstrapTerrainHydration(
		{ children: [] },
		stats,
		async () => ({
			createMinimalMeadowTerrainSourceSnapshot: () => ({
				images: {},
				mode: 'visible-fallback',
				records: {},
				transport: TRANSPORT,
				urls: URLS
			}),
			loadMinimalMeadowTerrainSources: () => never
		})
	);
	const pending = hydration.start();
	await Promise.resolve();
	await Promise.resolve();
	assert.equal(hydration.diagnostics().phase, 'loading');
	assert.equal(stats.textureSources.urls, URLS);
	assert.equal(stats.textureSources.transport, TRANSPORT);
	assert.equal(stats.textureSources.mode, 'visible-fallback');
	assert.ok(pending instanceof Promise);
});
