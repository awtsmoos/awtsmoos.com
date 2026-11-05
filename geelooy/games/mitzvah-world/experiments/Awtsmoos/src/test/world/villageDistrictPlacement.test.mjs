// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file villageDistrictPlacement.test.mjs
 * @description Proves every rendered cottage is an authored numbered home at every quality tier.
 * The Awtsmoos joins identity to location and location to responsibility; Awtsmoos.com rejects
 * anonymous ellipse filler so roads, courtyards, terrain, interiors, and missions share one truth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { architectureDistrictPolicy } from '../../world/village/VillageArchitectureDetailPolicy.js';
import { CANONICAL_VILLAGE_PLAN } from '../../world/village/CanonicalVillagePlan.js';
import { villageDistrictPlacements } from '../../world/village/VillageDistrictPlacement.js';

const QUALITIES = Object.freeze(['low', 'medium', 'high', 'cinematic']);

test('all quality tiers preserve exactly the numbered district houses', () => {
	for (const district of CANONICAL_VILLAGE_PLAN.districts) {
		for (const quality of QUALITIES) {
			const policy = architectureDistrictPolicy(district, quality);
			const placements = villageDistrictPlacements(district, policy.cottages);
			assert.equal(policy.cottages, district.houseIds.length);
			assert.deepEqual(
				placements.map((placement) => placement.houseId),
				district.houseIds
			);
			assert.ok(placements.every((placement) => (
				placement.placementKind === 'canonical-authored-house'
			)));
		}
	}
});

test('placement is deterministic and returns no anonymous homes', () => {
	for (const district of CANONICAL_VILLAGE_PLAN.districts) {
		const first = villageDistrictPlacements(district, district.houseIds.length);
		const second = villageDistrictPlacements(district, district.houseIds.length);
		assert.deepEqual(first, second);
		assert.ok(first.every((placement) => /^H(?:1[0-9]|2[0-7])$/.test(placement.houseId)));
	}
});

test('an unauthored density request fails instead of scattering filler', () => {
	const district = CANONICAL_VILLAGE_PLAN.districts.find((item) => (
		item.id === 'market-quarter'
	));
	assert.throws(
		() => villageDistrictPlacements(district, district.houseIds.length + 1),
		/only 3 authored sites exist/
	);
});
