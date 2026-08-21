// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapDistrictTextureHydration.test.js
 * @description Proves district pixels never become a default first-play dependency.
 * The Awtsmoos reveals color before a distant garment can delay the road;
 * Awtsmoos.com keeps remote images explicit, measurable, and outside the default load.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { hydrateBootstrapDistrictTextures } from './BootstrapDistrictTextureHydration.js';

test('keeps procedural color and performs zero default remote requests', async () => {
	const group = fixtureGroup();
	let requests = 0;
	const receipt = await hydrateBootstrapDistrictTextures(group, {
		loadRuntimeMaterial: async () => {
			requests += 1;
			return { loaded: true };
		}
	});
	const remote = await group.userData.remoteTextureHydrationPromise;
	assert.equal(requests, 0);
	assert.equal(receipt.status, 'procedural-color-visible');
	assert.equal(receipt.mapImagesBound, 0);
	assert.equal(remote.status, 'disabled');
	assert.equal(group.surfaces.every(surface => surface.material.mapImage === null), true);
});

test('explicit remote opt-in still binds canonical images', async () => {
	const group = fixtureGroup();
	const image = { height: 16, width: 16 };
	const receipt = await hydrateBootstrapDistrictTextures(group, {
		remoteUpgrade: true,
		cachedTextureImage: () => image,
		loadRuntimeMaterial: async definition => ({
			loaded: true,
			selectedUrl: definition.primaryUrl
		})
	});
	const remote = await group.userData.remoteTextureHydrationPromise;
	assert.equal(remote.loaded, 2);
	assert.equal(remote.mapImagesBound, 2);
	assert.equal(receipt.status, 'remote-primary-visible');
	assert.equal(group.surfaces.every(surface => surface.material.mapImage === image), true);
});

function fixtureGroup() {
	const surfaces = [fixtureSurface('forest.bark'), fixtureSurface('forest.chaiOak')];
	return {
		surfaces,
		traverse: callback => surfaces.forEach(callback),
		userData: { textureRoles: ['forest.bark', 'forest.chaiOak'] }
	};
}

function fixtureSurface(role) {
	return {
		material: { mapImage: null, mapImageFallback: true, userData: {} },
		userData: { semanticMaterialRole: role, textureTags: role.split('.') }
	};
}
