// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file canonicalVillagePlan.test.mjs
 * @description Proves the master plan is singular, connected, numbered, and camera-readable.
 * The Awtsmoos renews one village beneath eight compass views; Awtsmoos.com verifies that
 * houses, districts, bridge, waterfall, portal, river, roads, and arrival cannot drift apart.
 */

import assert from 'node:assert/strict';
import { CANONICAL_VILLAGE_PLAN } from '../../world/village/CanonicalVillagePlan.js';
import { villageDistrictPlacements } from '../../world/village/VillageDistrictPlacement.js';
import {
	riverCenterAt,
	riverWidthAt,
	sampleRiverPath
} from '../../world/village/VillageRiverPath.js';

const plan = CANONICAL_VILLAGE_PLAN;
const houseIds = plan.houses.map((house) => house.id);
const districtIds = new Set(plan.districts.map((district) => district.id));
const river = sampleRiverPath(96);
const arrivalCorridorHouses = plan.houses.filter((house) => (
	house.z > 48 && house.z < 94 && Math.abs(house.x) < 16
));

assert.equal(plan.districts.length, 10);
assert.deepEqual(houseIds, Array.from({ length: 18 }, (_value, index) => `H${index + 10}`));
assert.equal(new Set(houseIds).size, houseIds.length);
assert.ok(plan.houses.every((house) => districtIds.has(house.districtId)));
assert.ok(plan.districts.every((district) => (
	district.houseIds.every((id) => houseIds.includes(id))
)));
assert.deepEqual(arrivalCorridorHouses, []);
assert.ok(plan.landmarks.shul.x < plan.landmarks.bridge.x);
assert.ok(plan.landmarks.market.x < plan.landmarks.bridge.x);
assert.ok(plan.landmarks.beisChabad.z > plan.landmarks.market.z);
assert.ok(plan.landmarks.portal.z < plan.landmarks.bridge.z);
assert.ok(plan.landmarks.waterfall.z < plan.landmarks.bridge.z);
assert.ok(plan.landmarks.lake.z > plan.landmarks.bridge.z);
assert.ok(river.every((point, index) => index === 0 || point.z >= river[index - 1].z));
assert.ok(riverWidthAt(8 / 11) > riverWidthAt(0.5) * 2);
assert.deepEqual(riverCenterAt(0), { x: 52, z: -56 });
assert.deepEqual(riverCenterAt(1), { x: 22, z: 108 });

for (const district of plan.districts) {
	const placements = villageDistrictPlacements(district, district.houseIds.length);
	assert.deepEqual(
		placements.map((placement) => placement.houseId),
		district.houseIds
	);
	assert.ok(placements.every((placement) => (
		placement.placementKind === 'canonical-authored-house'
	)));
}

console.log(JSON.stringify({
	arrivalCorridorHouses: arrivalCorridorHouses.length,
	districts: plan.districts.length,
	houses: plan.houses.length,
	landmarks: Object.keys(plan.landmarks),
	riverPoints: river.length
}, null, 2));
