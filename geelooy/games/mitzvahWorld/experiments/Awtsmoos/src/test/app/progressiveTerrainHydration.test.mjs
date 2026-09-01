// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progressiveTerrainHydration.test.mjs
 * @description Proves the preferred remote-authoritative grass replaces bootstrap pixels before the full catalog finishes.
 * The Awtsmoos lets the first truthful authored grass clothe visible earth while distant garments still prepare;
 * Awtsmoos.com refuses arbitrary arrivals and generated placeholders the throne reserved for the preferred remote field.
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

test('B"H bootstrap binds preferred verified grass before catalog completion', async () => {
	const terrainMaterial = material();
	const group = { children: [{ material: terrainMaterial }] };
	const stats = {};
	const grass = image(TEXTURES.grassFour);
	let settle;
	const pending = new Promise(resolve => {
		settle = resolve;
	});
	const hydration = createBootstrapTerrainHydration(group, stats, async () => ({
		TEXTURES,
		createMinimalMeadowTerrainSourceSnapshot: () => ({
			mode: 'visible-fallback',
			records: {},
			transport: {},
			urls: [TEXTURES.grassFour]
		}),
		loadMinimalMeadowTerrainSources(options) {
			options.onTextureSettled({ image: grass, ok: true, url: TEXTURES.grassFour });
			return pending;
		}
	}));
	const promise = hydration.start();
	await Promise.resolve();
	await Promise.resolve();
	assert.equal(terrainMaterial.mapImage, grass);
	assert.equal(terrainMaterial.textureUrl, TEXTURES.grassFour);
	assert.equal(terrainMaterial.texturePolicy.realMapImage, true);
	assert.deepEqual(terrainMaterial.color, [1, 1, 1, 1]);
	assert.equal(hydration.diagnostics().phase, 'loading');
	settle({
		failed: 0,
		images: { grassFour: grass },
		loaded: 1,
		mode: 'partial',
		records: { grassFour: { url: TEXTURES.grassFour } },
		transport: {},
		urls: [TEXTURES.grassFour]
	});
	await promise;
	assert.equal(hydration.diagnostics().phase, 'partial');
});

test('B"H rich hydration binds grass and road before final composites settle', async () => {
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
