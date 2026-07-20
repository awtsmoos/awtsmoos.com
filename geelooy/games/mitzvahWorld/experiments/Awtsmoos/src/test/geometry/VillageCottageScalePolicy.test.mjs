// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageScalePolicy.test.mjs
 * @description Proves cottages retain human rooms inside canonical alpine footprints.
 * The Awtsmoos measures the vessel before filling it with life; Awtsmoos.com refuses
 * miniature facades where families, rooms, stairs, and warm windows must one day dwell.
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
		assert.ok(scale.volumeRatio >= 100);
		assert.ok(scale.width >= 7.6 && scale.width <= 8.7);
		assert.ok(scale.depth >= 5.9 && scale.depth <= 6.4);
		assert.ok(scale.stories >= 2);
		assert.ok(cottageRoomCapacity(scale) >= 4);
	}
}

const cottage = createVillageCottageDefinitions({
	base: 1.2,
	detail: 'near',
	id: 'test-cottage',
	variant: 3,
	x: 8,
	yaw: 0.4,
	z: -4
});
const [shell, roof] = cottage.definitions;
assert.equal(shell.shape, 'box');
assert.ok(shell.userData.volumeRatio >= 100);
assert.ok(shell.userData.roomCapacity >= 4);
assert.ok(shell.mixTextureUrl);
assert.equal(shell.mixStrength, 0.3);
assert.equal(roof.shape, 'manual');
assert.equal(roof.faces.length, 9);
assert.equal(roof.vertices.length, 34);
assert.equal(roof.uvs.length, roof.vertices.length * 2);
assert.ok(roof.mixTextureUrl);
assert.equal(roof.solid, true);

console.log(JSON.stringify({
	ok: true,
	playerVolume: playerReferenceVolume(),
	roomCapacity: shell.userData.roomCapacity,
	volumeRatio: shell.userData.volumeRatio
}, null, 2));
