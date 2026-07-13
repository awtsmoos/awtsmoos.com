// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldTextureManifest.test.mjs
 * @description Guards the critical image preload from models and unpublished
 * sources, allowing each vessel to enter the world in the order of Awtsmoos.
 */
import assert from 'node:assert/strict';
import { WORLD_TEXTURE_MATERIALS } from '../../assets/WorldTextureManifest.js';

const imageExtension = /\.(png|jpe?g|webp|gif|svg|avif)(?:\?|$)/i;
const roles = new Set();

assert.ok(WORLD_TEXTURE_MATERIALS.length > 20);
for (const material of WORLD_TEXTURE_MATERIALS) {
	assert.equal(roles.has(material.role), false, `${material.role} must be unique`);
	roles.add(material.role);
	assert.match(material.primaryUrl, imageExtension, `${material.role} must preload an image`);
	assert.equal(/\.glb(?:\?|$)/i.test(material.primaryUrl), false);
	assert.equal(material.primaryUrl.includes('/processed/botany/'), false);
	for (const fallbackUrl of material.fallbackUrls) {
		assert.match(fallbackUrl, imageExtension);
	}
}

console.log(JSON.stringify({
	ok: true,
	roles: WORLD_TEXTURE_MATERIALS.length,
	botanicalRoles: WORLD_TEXTURE_MATERIALS
		.filter((material) => material.role.includes('aspen'))
		.map((material) => material.role)
}, null, 2));
