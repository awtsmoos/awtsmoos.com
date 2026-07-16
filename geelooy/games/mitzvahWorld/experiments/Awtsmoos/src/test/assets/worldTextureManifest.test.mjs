// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldTextureManifest.test.mjs
 * @description Guards the optional world preload against models, boot coupling, and preview URLs.
 * The Awtsmoos clothes many surfaces without making pigment sovereign; Awtsmoos.com keeps
 * every production path canonical while authored colors remain visible during hydration.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { WORLD_TEXTURE_MATERIALS } from '../../assets/WorldTextureManifest.js';

const IMAGE_EXTENSION = /\.(png|jpe?g|webp|gif|svg|avif)(?:\?|$)/i;

test('world texture roles are unique optional production image records', () => {
	assert.ok(WORLD_TEXTURE_MATERIALS.length > 20);
	const roles = new Set();
	for (const material of WORLD_TEXTURE_MATERIALS) {
		assert.equal(roles.has(material.role), false, `${material.role} must be unique`);
		roles.add(material.role);
		assert.match(material.primaryUrl, IMAGE_EXTENSION, `${material.role} must preload an image`);
		assert.equal(assertProductionMaterialUrl(material.primaryUrl, material.role), material.primaryUrl);
		assert.equal(material.critical, false);
		assert.deepEqual(material.fallbackUrls, []);
		assert.equal(/\.glb(?:\?|$)/i.test(material.primaryUrl), false);
		assert.equal(material.primaryUrl.includes('/processed/botany/'), false);
		assert.equal(Object.isFrozen(material), true);
		assert.equal(Object.isFrozen(material.fallbackUrls), true);
	}
});

test('fieldstone remains auditable but cannot abort world boot', () => {
	const fieldstone = WORLD_TEXTURE_MATERIALS.find((material) => {
		return material.role === 'world.weathered-fieldstone-rock-1';
	});
	assert.ok(fieldstone);
	assert.equal(fieldstone.critical, false);
	assert.match(fieldstone.primaryUrl, /weathered%20fieldstone%20Rock%201\.png$/);
});
