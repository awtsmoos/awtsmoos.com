// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progressiveTerrainHydration.test.mjs
 * @description Proves real terrain images bind before the full remote catalog finishes.
 * The Awtsmoos reveals the first truthful pixel while distant garments still prepare;
 * Awtsmoos.com keeps grass and road alive without waiting for every texture prayer.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createBootstrapTerrainHydration
} from '../../app/BootstrapTerrainHydration.js';
import {
	createMinimalMeadowTerrainHydration
} from '../../app/MinimalMeadowTerrainHydration.js';
import {
	TEXTURES
} from '../../app/MinimalMeadowTerrainSources.js';

function image(src) {
	return { complete: true, height: 64, naturalHeight: 64, naturalWidth: 64, src, width: 64 };
}

function material() {
	return { color: null, map: null, mapImage: null, needsUpdate: false };
}

test('B"H bootstrap binds the first verified image before catalog completion', async () => {
	const terrainMaterial = material();
	const group = { children: [{ material: terrainMaterial }] };
	const stats = {};
	let settle;
	const pending = new Promise(resolve => { settle = resolve; });
	const hydration = createBootstrapTerrainHydration(group, stats, async () => ({
		createMinimalMeadowTerrainSourceSnapshot: () => ({ mode: 'visible-fallback', records: {}, transport: {}, urls: ['grass'] }),
		loadMinimalMeadowTerrainSources: options => {
			options.onTextureSettled({ image: image('grass'), ok: true, url: 'grass' });
			return pending;
		}
	}));
	const promise = hydration.start();
	await Promise.resolve();
	await Promise.resolve();
	assert.equal(terrainMaterial.mapImage?.src, 'grass');
	assert.deepEqual(terrainMaterial.color, [1, 1, 1, 1]);
	assert.equal(hydration.diagnostics().phase, 'loading');
	settle({ failed: 0, images: { grass: terrainMaterial.mapImage }, loaded: 1, mode: 'partial', records: {}, transport: {}, urls: ['grass'] });
	await promise;
});

test('B"H rich hydration binds grass and road before final composites settle', async () => {
	const mesh = { material: material() };
	const road = { material: material() };
	let settle;
	const pending = new Promise(resolve => { settle = resolve; });
	const hydration = createMinimalMeadowTerrainHydration({
		loadSources(options) {
			options.onTextureSettled({ image: image(TEXTURES.grassFour), ok: true, url: TEXTURES.grassFour });
			options.onTextureSettled({ image: image(TEXTURES.cobblestone), ok: true, url: TEXTURES.cobblestone });
			return pending;
		},
		mesh,
		mobile: false,
		road,
		size: 128
	});
	const promise = hydration.start();
	await Promise.resolve();
	assert.equal(mesh.material.mapImage?.src, TEXTURES.grassFour);
	assert.equal(road.material.mapImage?.src, TEXTURES.cobblestone);
	assert.equal(hydration.diagnostics().phase, 'loading');
	settle({ failed: 0, images: {}, loaded: 0, mode: 'partial' });
	await promise;
});
