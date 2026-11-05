// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every measured road and riverbank; Awtsmoos.com tests the finite contract,
 * so semantic names may point home while camera lanes remain dry along their entire tract.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	canonicalVillageLocation,
	canonicalVillageLocationShot,
	listCanonicalVillageLocations
} from '../../world/village/CanonicalVillageLocations.js';
import { auditVillageLocationRealism, villageRiverClearance } from '../../world/village/VillageLocationRealism.js';

test('river-garden owns five sampled west-bank lanes outside the river corridor', () => {
	const profile = canonicalVillageLocation('river-garden');
	const audit = auditVillageLocationRealism(profile);
	assert.equal(audit.ready, true, audit.issues.join('\n'));
	assert.equal(audit.shotCount, 5);
	for (const shot of audit.shots) {
		assert.ok(shot.sampleCount >= 3);
		assert.ok(shot.minimumRiverClearance >= 4);
	}
	assert.ok(villageRiverClearance(profile.actor) > 0);
});

test('legacy motif names resolve to geographic places without duplicating the location list', () => {
	assert.equal(canonicalVillageLocation('infinite-light').id, 'arrival-horizon');
	assert.equal(canonicalVillageLocation('empty-vessel').id, 'village-well');
	assert.equal(canonicalVillageLocation('world-renewed').id, 'market-square');
	assert.deepEqual(
		listCanonicalVillageLocations().map(value => value.id),
		['river-garden', 'village-well', 'arrival-horizon', 'waterfall-portal', 'shul-terrace', 'market-square']
	);
});

test('shot resolution belongs to physical location rather than semantic rig vocabulary', () => {
	const river = canonicalVillageLocation('river-garden');
	const shot = canonicalVillageLocationShot(river, 'aerialPullback');
	assert.equal(river.id, 'river-garden');
	assert.ok(shot.from.x <= -4 && shot.to.x <= -4);
	assert.ok(shot.from.z >= 18 && shot.to.z >= 18);
});
