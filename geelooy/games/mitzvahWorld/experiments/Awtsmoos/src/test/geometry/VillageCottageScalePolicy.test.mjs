// B"H
// Boruch Hashem
// Blessed is He

/** @file VillageCottageScalePolicy.test.mjs @description Proves inhabitable three-story scale and indexed interiors. */
import assert from 'node:assert/strict';
import { cottageRoomCapacity, playerReferenceVolume, villageCottageScalePolicy } from '../../world/village/VillageCottageScalePolicy.js';
import { createVillageCottageDefinitions } from '../../world/village/VillageCottageDefinitionFactory.js';
assert.ok(playerReferenceVolume() > 0);
for (const detail of ['near', 'medium', 'far']) {
	for (let variant = 0; variant < 12; variant += 1) {
		const scale = villageCottageScalePolicy(detail, variant);
		assert.ok(scale.expansionRatio >= scale.minimumExpansion);
		assert.ok(scale.volumeRatio >= 100);
		assert.equal(scale.width, 19.2 + variant % 3 * 1.2);
		assert.equal(scale.depth, 15.4 + variant % 2 * 1.1);
		assert.equal(scale.stories, 3);
		assert.ok(cottageRoomCapacity(scale) >= 26);
	}
}
const cottage = createVillageCottageDefinitions({ base: 1.2, detail: 'near', id: 'H10', variant: 3, x: 8, yaw: 0.4, z: -4 });
const [envelope, interior, roof] = cottage.definitions;
assert.equal(cottage.definitions.length, 3);
assert.equal(envelope.shape, 'manual');
assert.equal(envelope.solid, true);
assert.equal(envelope.vertices.length, 56);
assert.equal(envelope.faces.length, 37);
assert.equal(envelope.userData.canonicalId, 'H10');
assert.equal(envelope.userData.part, 'stone-plinth-and-open-recessed-wall-envelope');
assert.ok(envelope.userData.foundationHeight > 0);
assert.ok(envelope.userData.roomCapacity >= 26);
assert.ok(envelope.mixTextureUrl);
assert.equal(interior.shape, 'manual');
assert.ok(interior.vertices.length > 0);
assert.ok(interior.indices.length > 0);
assert.equal(interior.indices.length % 3, 0);
assert.equal(interior.userData.roomCount, 12);
assert.equal(interior.userData.doorOpenings, 12);
assert.equal(roof.shape, 'manual');
assert.equal(roof.faces.length, 9);
assert.equal(roof.vertices.length, 34);
assert.equal(roof.uvs.length, roof.vertices.length * 2);
assert.ok(roof.mixTextureUrl);
assert.equal(roof.solid, true);
