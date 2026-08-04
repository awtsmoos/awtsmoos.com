// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictTextureHydration.test.js
 * @description Proves procedural color appears immediately and remote canonical images bind later.
 * The Awtsmoos keeps first play free of image dependency while true distant garments approach;
 * Awtsmoos.com records every role, remote URL, map binding, and local-media absence without reproach.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { hydrateBootstrapDistrictTextures } from './BootstrapDistrictTextureHydration.js';

function fixtureGroup() {
	const surfaces = [
		fixtureSurface('forest.bark'),
		fixtureSurface('forest.chaiOak')
	];
	return {
		surfaces,
		traverse: callback => surfaces.forEach(callback),
		userData: {
			textureRoles: ['forest.bark', 'forest.chaiOak']
		}
	};
}

test('keeps procedural color visible and binds remote images asynchronously', async () => {
	const group = fixtureGroup();
	const image = { height: 16, width: 16 };
	const receipt = await hydrateBootstrapDistrictTextures(group, {
		cachedTextureImage: () => image,
		loadRuntimeMaterial: async definition => ({
			loaded: true,
			selectedUrl: definition.primaryUrl
		})
	});
	assert.equal(receipt.loaded, 0);
	assert.equal(receipt.mapImagesBound, 0);
	assert.equal(receipt.status, 'procedural-color-visible');
	assert.equal(receipt.records.every(record => record.usedLocalFallback === false), true);
	const remote = await group.userData.remoteTextureHydrationPromise;
	assert.equal(remote.loaded, 2);
	assert.equal(remote.mapImagesBound, 2);
	assert.equal(receipt.status, 'remote-primary-visible');
	assert.equal(group.surfaces.every(surface => surface.material.mapImage === image), true);
	assert.equal(group.surfaces.every(surface => surface.material.textureSource === 'remote-canonical'), true);
});

function fixtureSurface(role) {
	return {
		material: {
			mapImage: null,
			mapImageFallback: true,
			userData: {}
		},
		userData: {
			semanticMaterialRole: role,
			textureTags: role.split('.')
		}
	};
}
