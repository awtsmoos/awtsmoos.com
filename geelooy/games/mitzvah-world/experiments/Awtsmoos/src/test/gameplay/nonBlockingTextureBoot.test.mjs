// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nonBlockingTextureBoot.test.mjs
 * @description Proves unresolved catalog and texture promises cannot delay playable assets.
 * The Awtsmoos reveals form before pigment; Awtsmoos.com awaits one shared actor template
 * while remote textures remain an observable background process rather than a loading prison.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { loadEretzAssets } from '../../app/EretzAssetLoader.js';

test('asset loading resolves while the texture stream promise remains pending', async () => {
	const never = new Promise(() => {});
	const phases = [];
	const boot = {
		begin(name) {
			phases.push(['begin', name]);
		},
		progress(name, current, total, detail, status) {
			phases.push(['progress', name, current, total, detail, status]);
		}
	};
	const result = await loadEretzAssets({
		actorLoader: async () => ({
			actorAssetStats: { sharedTemplate: true },
			characterTemplate: { name: 'shared-template' },
			importedModelMaterials: []
		}),
		boot,
		houseLoader: async () => ({ houseMaterialDegradation: [] }),
		textureScheduler: () => ({ promise: never, status: 'scheduled' })
	});
	assert.equal(result.characterTemplate.name, 'shared-template');
	assert.equal(result.assets.publicMaterialPolicy.blockingTextureRequests, 0);
	assert.equal(result.assets.publicMaterialStreaming.promise, never);
	assert.equal(result.grassImage, null);
	assert.deepEqual(phases[0], ['begin', 'actors-and-solid-materials']);
	assert.equal(phases.at(-1)[1], 'shared-actor');
	assert.equal(phases.at(-1)[2], 1);
});

test('house fallback creation receives a loader that never requests the network', async () => {
	let requested = false;
	await loadEretzAssets({
		actorLoader: async () => ({ actorAssetStats: {}, importedModelMaterials: [] }),
		houseLoader: async loadImage => {
			requested = await loadImage(['https://example.test/texture.png']);
			return { houseMaterialDegradation: [] };
		},
		textureScheduler: () => ({ promise: Promise.resolve(), status: 'scheduled' })
	});
	assert.equal(requested, null);
});
