// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file progressiveTerrainHydration.test.mjs
 * @description Proves preferred grass binds immediately and canonical remote grass fallbacks rescue post-play terrain after preferred failure.
 * The Awtsmoos lets one named blade arrive first when it can, yet Awtsmoos.com keeps the field open to another genuine authored grass
 * already present in the same catalog when the preferred request fades into timeout.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createBootstrapTerrainHydration } from '../../app/BootstrapTerrainHydration.js';
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

test('B"H preferred grass still resolves before catalog completion', async () => {
	const terrainMaterial = material();
	const group = { children: [{ material: terrainMaterial }] };
	const stats = {};
	const grass = image(TEXTURES.grassFour);
	let settleCatalog;
	const pendingCatalog = new Promise(resolve => { settleCatalog = resolve; });
	const hydration = createBootstrapTerrainHydration(group, stats, async () => ({
		TEXTURES,
		createMinimalMeadowTerrainSourceSnapshot: () => ({ mode: 'visible-fallback', records: {}, transport: {}, urls: [TEXTURES.grassFour] }),
		loadMinimalMeadowTerrainSources(options) {
			options.onTextureSettled({ image: grass, ok: true, url: TEXTURES.grassFour });
			return pendingCatalog;
		}
	}));
	const first = hydration.start();
	assert.equal(first, hydration.start());
	const receipt = await first;
	assert.equal(receipt.phase, 'essential-ready');
	assert.equal(receipt.activeUrl, TEXTURES.grassFour);
	assert.equal(terrainMaterial.mapImage, grass);
	settleCatalog({
		failed: 0,
		images: { grassFour: grass },
		loaded: 1,
		mode: 'partial',
		records: { grassFour: { ok: true, url: TEXTURES.grassFour } },
		transport: {},
		urls: [TEXTURES.grassFour]
	});
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(hydration.diagnostics().phase, 'partial');
});

test('B"H canonical grass fallback binds after preferred timeout', async () => {
	const terrainMaterial = material();
	const group = { children: [{ material: terrainMaterial }] };
	const stats = {};
	const fallback = image(TEXTURES.grassOne);
	const hydration = createBootstrapTerrainHydration(group, stats, async () => ({
		TEXTURES,
		createMinimalMeadowTerrainSourceSnapshot: () => ({ mode: 'visible-fallback', records: {}, transport: {}, urls: [] }),
		async loadMinimalMeadowTerrainSources(options) {
			options.onTextureSettled({ error: 'timeout', ok: false, url: TEXTURES.grassFour });
			return {
				failed: 1,
				images: { grassFour: null, grassOne: fallback },
				loaded: 1,
				mode: 'partial',
				records: {
					grassFour: { ok: false, url: TEXTURES.grassFour },
					grassOne: { ok: true, url: TEXTURES.grassOne }
				},
				transport: {},
				urls: [TEXTURES.grassFour, TEXTURES.grassOne]
			};
		}
	}));
	const receipt = await hydration.start();
	assert.equal(receipt.phase, 'canonical-fallback-ready');
	assert.equal(receipt.activeUrl, TEXTURES.grassOne);
	assert.equal(terrainMaterial.mapImage, fallback);
	assert.equal(terrainMaterial.textureUrl, TEXTURES.grassOne);
	assert.equal(hydration.diagnostics().activeUrl, TEXTURES.grassOne);
	assert.equal(hydration.diagnostics().phase, 'partial');
});
