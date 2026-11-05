// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowTerrainDeferredHydration.test.mjs
 * @description Proves terrain geometry never waits for remote image loading or failure.
 * The Awtsmoos reveals visible earth before distant garments decode; Awtsmoos.com verifies
 * zero core requests, remote authority, fallback colors, idempotence, and resolved degradation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MINIMAL_MEADOW_AWTSMOOS_DRIVE_TEXTURES,
	minimalMeadowTextureTransportEvidence
} from '../../app/MinimalMeadowAwtsmoosDriveTextures.js';
import {
	createMinimalMeadowTerrainPackage
} from '../../app/MinimalMeadowTerrainPackage.js';
import {
	createMinimalMeadowTerrainSourceSnapshot
} from '../../app/MinimalMeadowTerrainSources.js';

test('B"H terrain catalog uses remote Drive assets and fallback colors only', () => {
	assert.ok(Object.values(MINIMAL_MEADOW_AWTSMOOS_DRIVE_TEXTURES).every(url => {
		return url.startsWith(
			'https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/'
		);
	}));
	assert.equal(minimalMeadowTextureTransportEvidence().fallbackAssetFiles, 0);
	assert.doesNotMatch(
		JSON.stringify(MINIMAL_MEADOW_AWTSMOOS_DRIVE_TEXTURES),
		/assets\/materials\/local|firebasestorage\.googleapis/
	);
});

test('B"H immediate source snapshot requires no image or network', () => {
	const snapshot = createMinimalMeadowTerrainSourceSnapshot();
	assert.equal(snapshot.mode, 'visible-fallback');
	assert.ok(Object.values(snapshot.images).every(image => image === null));
	assert.ok(Object.values(snapshot.records).every(record => {
		return record.status === 'deferred-remote';
	}));
	assert.equal(snapshot.transport.policy, 'remote-authoritative-fallback-colors-only');
});

test('B"H package remains visible and remote hydration failure resolves degraded', async () => {
	let loads = 0;
	const terrain = await createMinimalMeadowTerrainPackage({
		loadTextureSources: async () => {
			loads += 1;
			throw new Error('optional remote texture failure');
		},
		mobile: true
	});
	assert.equal(loads, 0);
	assert.equal(terrain.textureHydration.diagnostics().phase, 'deferred');
	assert.deepEqual(terrain.mesh.material.color, [0.24, 0.43, 0.21, 1]);
	assert.equal(terrain.road.material.color, '#716957');
	const first = terrain.startTextureHydration();
	const second = terrain.startTextureHydration();
	assert.equal(first, second);
	const receipt = await first;
	assert.equal(loads, 1);
	assert.equal(receipt.phase, 'degraded');
	assert.equal(receipt.error, 'optional remote texture failure');
});
