// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos.com test proves fortyfold footprints never enlarge doors or parent groups. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	HUMAN_SCALE_HOUSE_DOOR,
	MINIMUM_HOUSE_FOOTPRINT_EXPANSION
} from '../../app/MinimalMeadowHouseDimensionPolicy.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from '../../app/MinimalMeadowHouseProfiles.js';

const assemblyPath = fileURLToPath(new URL('../../app/MinimalMeadowHouseAssembly.js', import.meta.url));

test('every house expands its recorded legacy footprint by at least forty', () => {
	for (const profile of MINIMAL_MEADOW_HOUSE_PROFILES) {
		assert.ok(profile.footprintExpansion >= MINIMUM_HOUSE_FOOTPRINT_EXPANSION);
		assert.equal(profile.doorWidth, HUMAN_SCALE_HOUSE_DOOR.width);
		assert.equal(profile.doorHeight, HUMAN_SCALE_HOUSE_DOOR.height);
		assert.ok(Math.abs(profile.x) + profile.width / 2 <= 110);
		assert.ok(Math.abs(profile.z) + profile.depth / 2 <= 110);
		assert.equal(spawnInside(profile), false);
	}
});

test('expanded footprints retain a broad non-overlapping world corridor', () => {
	const [first, second] = MINIMAL_MEADOW_HOUSE_PROFILES;
	const gapX = Math.abs(first.x - second.x) - (first.width + second.width) / 2;
	const gapZ = Math.abs(first.z - second.z) - (first.depth + second.depth) / 2;
	assert.ok(gapX >= 4 || gapZ >= 4, { gapX, gapZ });
	assert.equal(gapX, 32);
});

test('assembly uses measured dimensions rather than parent scaling', () => {
	const source = fs.readFileSync(assemblyPath, 'utf8');
	assert.doesNotMatch(source, /group\.scale|scale\.set/);
	assert.match(source, /houseDimensionEvidence/);
});

function spawnInside(profile) {
	return Math.abs(profile.x) <= profile.width / 2 && Math.abs(profile.z) <= profile.depth / 2;
}
