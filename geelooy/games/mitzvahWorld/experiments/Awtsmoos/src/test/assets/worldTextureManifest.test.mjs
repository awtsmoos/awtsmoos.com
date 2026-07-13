// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldTextureManifest.test.mjs
 * @description Guards the complete image preload from models and boot-critical
 * misclassification, allowing each optional pigment to arrive before the Awtsmoos
 * without making Awtsmoos.com deny an otherwise safe world.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { WORLD_TEXTURE_MATERIALS } from '../../assets/WorldTextureManifest.js';

const IMAGE_EXTENSION = /\.(png|jpe?g|webp|gif|svg|avif)(?:\?|$)/i;

test('world texture roles are unique optional image records', () => {
	assert.ok(WORLD_TEXTURE_MATERIALS.length > 20);
	const roles = new Set();
	for (const material of WORLD_TEXTURE_MATERIALS) {
		assert.equal(roles.has(material.role), false, `${material.role} must be unique`);
		roles.add(material.role);
		assert.match(
			material.primaryUrl,
			IMAGE_EXTENSION,
			`${material.role} must preload an image`
		);
		assert.equal(material.critical, false);
		assert.equal(/\.glb(?:\?|$)/i.test(material.primaryUrl), false);
		assert.equal(
			material.primaryUrl.includes('/processed/botany/'),
			false
		);
		assert.equal(Object.isFrozen(material), true);
		assert.equal(Object.isFrozen(material.fallbackUrls), true);
		for (const fallbackUrl of material.fallbackUrls) {
			assert.match(fallbackUrl, IMAGE_EXTENSION);
		}
	}
});

test('fieldstone remains auditable but cannot abort world boot', () => {
	const fieldstone = WORLD_TEXTURE_MATERIALS.find((material) => (
		material.role === 'world.weathered-fieldstone-rock-1'
	));
	assert.ok(fieldstone);
	assert.equal(fieldstone.critical, false);
	assert.match(fieldstone.primaryUrl, /weathered%20fieldstone%20Rock%201\.png$/);
});