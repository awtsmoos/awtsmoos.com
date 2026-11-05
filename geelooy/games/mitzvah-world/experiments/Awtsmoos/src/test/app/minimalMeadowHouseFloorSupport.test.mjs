// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowHouseFloorSupport.test.mjs
 * @description Proves room floors, stair apertures, bidirectional treads, and terrain priority.
 * The Awtsmoos sustains every story yet opens one truthful path between; Awtsmoos.com keeps room
 * floors solid, removes the upper sheet over stairs, and lets descent proceed without upward capture.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createMinimalMeadowHouseFloorSupport } from '../../app/MinimalMeadowHouseFloorSupport.js';
import { housePoint } from '../../app/MinimalMeadowHouseMath.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from '../../app/MinimalMeadowHouseProfiles.js';
import { createMinimalMeadowHouseStairSupport } from '../../app/MinimalMeadowHouseStairSupport.js';
import { minimalMeadowHouseSupportReceipt } from '../../app/MinimalMeadowHouseSupportResolver.js';
import { minimalMeadowGroundReceipt } from '../../app/MinimalMeadowGroundSupport.js';

function storyProfile() {
	return MINIMAL_MEADOW_HOUSE_PROFILES.find(profile => profile.floors > 1);
}

test('B"H room floors remain solid while the stair aperture yields', () => {
	const profile = storyProfile();
	const support = createMinimalMeadowHouseFloorSupport(profile, 2);
	const [lower, upper] = support.levels;
	const room = housePoint(profile, profile.layout.interiorWidth * 0.25, 0);
	assert.equal(support.heightAt(room.x, room.z, lower), lower);
	assert.equal(support.heightAt(room.x, room.z, lower - 3), lower);
	assert.equal(support.heightAt(room.x, room.z, upper - 0.4, upper + 1), upper);
	const aperture = housePoint(
		profile,
		0,
		(support.aperture.startZ + support.aperture.endZ) / 2
	);
	assert.equal(support.heightAt(aperture.x, aperture.z, upper), null);
	assert.equal(support.heightAt(profile.x + profile.width, profile.z, lower), null);
});

test('B"H every stair tread supports a monotonic descent from the upper story', () => {
	const profile = storyProfile();
	const stair = createMinimalMeadowHouseStairSupport(profile, 2);
	let current = stair.lowerY + profile.storyHeight;
	const descending = [];
	for (let index = stair.steps - 1; index >= 0; index -= 1) {
		const localZ = stair.startZ - (index + 0.5) * stair.tread;
		const point = housePoint(profile, 0, localZ);
		const height = stair.heightAt(point.x, point.z, current);
		assert.equal(Number.isFinite(height), true, `tread ${index}`);
		assert.ok(height <= current, `tread ${index} snapped upward`);
		descending.push(height);
		current = height;
	}
	assert.ok(descending.at(-1) < descending[0]);
	assert.equal(descending.at(-1), stair.lowerY + stair.rise);
	const lowerFloorPoint = housePoint(profile, 0, stair.startZ + 0.3);
	const floor = createMinimalMeadowHouseFloorSupport(profile, 2);
	assert.equal(floor.heightAt(lowerFloorPoint.x, lowerFloorPoint.z, stair.lowerY), stair.lowerY);
});

test('B"H room floor receipt outranks terrain beneath the house', () => {
	const profile = MINIMAL_MEADOW_HOUSE_PROFILES[0];
	const support = createMinimalMeadowHouseFloorSupport(profile, 2);
	const point = housePoint(profile, profile.layout.interiorWidth * 0.25, 0);
	const floor = support.levels[0];
	const houses = {
		supportReceiptAt(x, z, currentY, previousY) {
			return minimalMeadowHouseSupportReceipt([support], x, z, currentY, previousY);
		}
	};
	const receipt = minimalMeadowGroundReceipt({
		houses,
		terrain: { heightAt: () => -2 }
	}, point.x, point.z, floor - 2, floor - 2);
	assert.equal(receipt.height, floor);
	assert.equal(receipt.source, 'story-floor');
	assert.equal(receipt.profileId, profile.id);
});
