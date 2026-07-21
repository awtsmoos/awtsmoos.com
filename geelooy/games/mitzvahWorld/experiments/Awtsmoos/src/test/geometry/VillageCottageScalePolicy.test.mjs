// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageScalePolicy.test.mjs
 * @description Proves every cottage tier remains a full inhabitable alpine household.
 * The Awtsmoos measures each vessel before filling it with life; Awtsmoos.com refuses
 * miniature facades and preserves rooms, stories, roof, identity, and tenfold volume.
 */

import assert from 'node:assert/strict';
import {
	cottageRoomCapacity,
	playerReferenceVolume,
	villageCottageScalePolicy
} from '../../world/village/VillageCottageScalePolicy.js';
import { createVillageCottageDefinitions } from '../../world/village/VillageCottageDefinitionFactory.js';

assert.ok(playerReferenceVolume() > 0);
for (const detail of ['near', 'medium', 'far']) {
	for (let variant = 0; variant < 12; variant += 1) {
		const scale = villageCottageScalePolicy(detail, variant);
		assert.ok(scale.expansionRatio >= scale.minimumExpansion);
		assert.ok(scale.volumeRatio >= 100);
		assert.ok(scale.width >= 18.8 && scale.width <= 21);
		assert.ok(scale.depth >= 14.2 && scale.depth <= 15.25);
		assert.equal(scale.stories, 3);
		assert.ok(cottageRoomCapacity(scale) >= 26);
	}
}

const cottage = createVillageCottageDefinitions({
	base: 1.2,
	detail: 'near',
	id: 'H10',
	variant: 3,
	x: 8,
	yaw: 0.4,
	z: -4
});
const [envelope, roof] = cottage.definitions;

assert.equal(cottage.definitions.length, 2);
assert.equal(envelope.shape, 'manual');
assert.equal(envelope.solid, true);
assert.equal(envelope.vertices.length, 48);
assert.equal(envelope.faces.length, 32);
assert.equal(envelope.userData.canonicalId, 'H10');
assert.equal(envelope.userData.houseId, 'H10');
assert.equal(envelope.userData.part, 'stone-plinth-and-recessed-wall-envelope');
assert.ok(envelope.userData.recessDepth > 0);
assert.ok(envelope.userData.foundationHeight > 0);
assert.ok(envelope.userData.expansionRatio >= 10);
assert.ok(envelope.userData.volumeRatio >= 100);
assert.ok(envelope.userData.roomCapacity >= 26);
assert.ok(envelope.mixTextureUrl);
assert.equal(envelope.mixStrength, 0.3);
assert.equal(roof.shape, 'manual');
assert.equal(roof.faces.length, 9);
assert.equal(roof.vertices.length, 34);
assert.equal(roof.uvs.length, roof.vertices.length * 2);
assert.ok(roof.mixTextureUrl);
assert.equal(roof.solid, true);

console.log(JSON.stringify({
	expansionRatio: envelope.userData.expansionRatio,
	ok: true,
	playerVolume: playerReferenceVolume(),
	roomCapacity: envelope.userData.roomCapacity,
	volumeRatio: envelope.userData.volumeRatio
}, null, 2));
