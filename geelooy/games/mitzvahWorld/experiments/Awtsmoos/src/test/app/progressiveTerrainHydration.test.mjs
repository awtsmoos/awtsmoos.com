// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progressiveTerrainHydration.test.mjs
 * @description Proves preferred authored grass unlocks essential bootstrap readiness before the complete remote catalog finishes.
 * The Awtsmoos lets one verified blade clothe visible earth while distant garments continue to prepare;
 * Awtsmoos.com keeps first-frame truth independent from optional enrichment without giving fallback pixels the chair.
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
	return {
		complete: true,
		dataset: { publicUrl: src },
		height: 64,
		naturalHeight: 64,
		naturalWidth: 64,
		src,
		width: 64
	};
}

function material() {
	return { color: null, map: null, mapImage: null, needsUpdate: false };
}

test('B"H bootstrap readiness resolves on preferred grass before catalog completion', async () => {
	const terrainMaterial = material();
	const group = { children: [{ material: terrainMaterial }] };
	const stats = {};
	const grass = image(TEXTURES.grassFour);
	let settleCatalog;
	const pendingCatalog = new Promise(resolve => {
		settleCatalog = resolve;
	});
	const hydration = createBootstrapTerrainHydration(group, stats, async () => ({
		TEXTURES,
		createMinimalMeadowTerrainSourceSnapshot: () => ({
			mode: 'visible-fallback', records: {}, transport: {}, urls: [TEXTURES.grassFour]
		}),
		loadMinimalMeadowTerrainSources(options) {
			options.onTextureSettled({ image: grass, ok: true, url: TEXTURES.grassFour });
			return pendingCatalog;
		}
	}));
	const first = hydration.start();
	const second = hydration.start();
	assert.equal(first, second);
	const receipt = await first;
	assert.equal(receipt.phase, 'essential-ready');
	assert.equal(receipt.loaded, 1);
	assert.equal(terrainMaterial.mapImage, grass);
	assert.equal(terrainMaterial.textureUrl, TEXTURES.grassFour);
	assert.equal(terrainMaterial.texturePolicy.realMapImage, true);
	assert.deepEqual(terrainMaterial.color, [1, 1, 1, 1]);
	assert.equal(hydration.diagnostics().phase, 'essential-ready');

	settleCatalog({
		failed: 0,
		images: { grassFour: grass },
		loaded: 1,
		mode: 'partial',
		records: { grassFour: { url: TEXTURES.grassFour } },
		transport: {},
		urls: [TEXTURES.grassFour]
	});
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(hydration.diagnostics().phase, 'partial');
});

test('B"H rich hydration still binds grass and road before final composites settle', async () => {
	const mesh = { material: material() };
	const road = { material: material() };
	let settle;
	const pending = new Promise(resolve => {
		settle = resolve;
	});
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
