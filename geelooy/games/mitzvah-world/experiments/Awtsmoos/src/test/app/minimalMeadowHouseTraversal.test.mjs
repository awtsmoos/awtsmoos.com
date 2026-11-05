// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos.com test guards level floors, normal openings, stairs, and positive colliders. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createMinimalMeadowHouseFoundation } from '../../app/MinimalMeadowHouseFoundation.js';
import { createMinimalMeadowHouseRooms } from '../../app/MinimalMeadowHouseRooms.js';
import { createMinimalMeadowHouseShell } from '../../app/MinimalMeadowHouseShell.js';
import { createMinimalMeadowHouseStairs } from '../../app/MinimalMeadowHouseStairs.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from '../../app/MinimalMeadowHouseProfiles.js';

const materials = Object.freeze({
	brick: Object.freeze({ color: '#8b4a38' }),
	brickLight: Object.freeze({ color: '#d0b08f' }),
	floor: Object.freeze({ color: '#817463' }),
	roof: Object.freeze({ color: '#743a32' })
});
const terrain = (x, z) => Math.sin(x * 0.025) * 2.4 + Math.cos(z * 0.021) * 1.8;

test('measured foundation creates accessible steps and a level platform', () => {
	for (const profile of MINIMAL_MEADOW_HOUSE_PROFILES) {
		const foundation = createMinimalMeadowHouseFoundation(profile, materials, terrain);
		assert.ok(foundation.evidence.maximumStepRise <= 0.2 + Number.EPSILON);
		assert.ok(foundation.evidence.entrySteps >= 1);
		assert.ok(foundation.evidence.terrainVariance >= 0);
		assert.ok(foundation.definitions.every(hasPositiveSize));
	}
});

test('two-story plan aligns normal doors, broad hall, and usable stairs', () => {
	const profile = MINIMAL_MEADOW_HOUSE_PROFILES[0];
	const foundation = createMinimalMeadowHouseFoundation(profile, materials, terrain);
	const rooms = createMinimalMeadowHouseRooms(profile, materials, foundation.groundY);
	const shell = createMinimalMeadowHouseShell(profile, materials, foundation.groundY);
	const stairs = createMinimalMeadowHouseStairs(profile, materials, foundation.groundY);
	assert.equal(rooms.roomCount, profile.floors * 7);
	assert.equal(rooms.doors.length, profile.floors * 6);
	assert.ok(profile.layout.hallWidth > 0.76 * 4);
	assert.ok(stairs.stats.maximumRise <= profile.layout.stairMaximumRise);
	assert.ok(stairs.stats.width > 0.76 * 3);
	assert.equal(stairs.stats.openingDepth, profile.layout.stairRun + profile.layout.stairLandingDepth + 1);
	assert.ok([...rooms.definitions, ...shell, ...stairs.definitions].every(hasPositiveSize));
});

function hasPositiveSize(definition) {
	return definition.size.x > 0 && definition.size.y > 0 && definition.size.z > 0;
}
