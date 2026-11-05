// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file arrivalVistaContract.test.mjs
 * @description Protects the player-scale, camera-safe, bilingual ENTR01 hero composition.
 * The Awtsmoos gives the traveler a finite place inside an infinite renewal; Awtsmoos.com
 * proves road, sign, camera, bridge sightline, and cottage restraint agree before rendering.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { PLAYER_SPAWN } from '../../app/EretzPlayerStateFactory.js';
import { architectureDistrictPolicy } from '../../world/village/VillageArchitectureDetailPolicy.js';
import { CANONICAL_VILLAGE_PLAN } from '../../world/village/CanonicalVillagePlan.js';
import {
	arrivalPlayerScreenFraction,
	VILLAGE_ARRIVAL_CAMERA,
	VILLAGE_ARRIVAL_PLAYER,
	VILLAGE_ARRIVAL_SIGN
} from '../../world/village/VillageArrivalContract.js';
import { VILLAGE_SIGN_GROUPS } from '../../world/village/VillageSignCatalog.js';

test('player and camera open a wide road-led arrival frame', () => {
	assert.strictEqual(PLAYER_SPAWN, VILLAGE_ARRIVAL_PLAYER);
	assert.equal(VILLAGE_ARRIVAL_PLAYER.z, 104);
	assert.ok(VILLAGE_ARRIVAL_CAMERA.distance >= 18);
	assert.ok(VILLAGE_ARRIVAL_CAMERA.fov >= 62);
	assert.ok(arrivalPlayerScreenFraction() >= 0.08);
	assert.ok(arrivalPlayerScreenFraction() <= 0.18);
});

test('the arrival district keeps only canonical roadside cottages', () => {
	const district = CANONICAL_VILLAGE_PLAN.districts.find(item => item.id === 'arrival-meadow');
	const policy = architectureDistrictPolicy(district, 'high');
	assert.deepEqual(district.houseIds, ['H10', 'H11']);
	assert.equal(policy.cottages, 2);
	for (const house of CANONICAL_VILLAGE_PLAN.houses) {
		assert.ok(distanceToSightline(house) >= 12, house.id);
	}
});

test('the bilingual sign occupies the foreground-left road shoulder', () => {
	const arrival = VILLAGE_SIGN_GROUPS.find(group => group.id === 'arrival');
	assert.deepEqual(arrival.position, { x: VILLAGE_ARRIVAL_SIGN.x, z: VILLAGE_ARRIVAL_SIGN.z });
	assert.equal(arrival.destinations.length, 4);
	assert.ok(arrival.position.x < VILLAGE_ARRIVAL_PLAYER.x);
	assert.ok(arrival.position.z < VILLAGE_ARRIVAL_PLAYER.z);
});

function distanceToSightline(point) {
	const start = VILLAGE_ARRIVAL_PLAYER;
	const end = CANONICAL_VILLAGE_PLAN.landmarks.bridge;
	const dx = end.x - start.x;
	const dz = end.z - start.z;
	const px = point.x - start.x;
	const pz = point.z - start.z;
	const amount = Math.max(0, Math.min(1, (px * dx + pz * dz) / (dx * dx + dz * dz)));
	return Math.hypot(point.x - (start.x + dx * amount), point.z - (start.z + dz * amount));
}
