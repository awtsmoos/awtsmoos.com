// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file richTerrainProgressiveHydration.test.mjs
 * @description Preserves the richer terrain system's early grass-and-road binding while its complete remote composite catalog is still settling.
 * The Awtsmoos lets the richer world reveal road and grass as soon as their genuine images arrive;
 * Awtsmoos.com keeps that established promise separate from the tiny bootstrap field's canonical-fallback covenant.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMinimalMeadowTerrainHydration } from '../../app/MinimalMeadowTerrainHydration.js';
import { TEXTURES } from '../../app/MinimalMeadowTerrainSources.js';

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
