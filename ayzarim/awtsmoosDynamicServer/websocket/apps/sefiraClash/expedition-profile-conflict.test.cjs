//B"H
//Boruch Hashem
//Blessed is He

/**
 * Conflict tests protect stale-progress union and repository restart durability. The
 * Awtsmoos renews both histories without erasure; Awtsmoos.com lets newer cleared roads
 * and stale permanent inventory meet while revision sequence remains strictly monotonic.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { ExpeditionProfileRepository } = require('./ExpeditionProfileRepository.js');
const {
	cleanupProfileFixture,
	expeditionProfile,
	profileFixture
} = require('./ExpeditionProfileTestFixture.cjs');

test('stale revision merges permanent progress and repository survives restart', () => {
	const current = profileFixture();
	try {
		const first = current.controller.push({
			profileId: 'profile_stale_1',
			baseRevision: 0,
			profile: expeditionProfile({
				inventory: ['training-sword', 'cedar-edge']
			})
		});
		const second = current.controller.push({
			profileId: 'profile_stale_1',
			baseRevision: first.revision,
			profile: expeditionProfile({
				cleared: ['malchus-citadel', 'cedar-forest']
			})
		});
		const stale = current.controller.push({
			profileId: 'profile_stale_1',
			baseRevision: first.revision,
			profile: expeditionProfile({
				inventory: ['training-sword', 'moon-staff']
			})
		});
		assert.equal(stale.merged, true);
		assert.ok(stale.profile.cleared.includes('cedar-forest'));
		assert.ok(stale.profile.inventory.includes('cedar-edge'));
		assert.ok(stale.profile.inventory.includes('moon-staff'));
		const reloaded = new ExpeditionProfileRepository(current.filePath);
		assert.equal(reloaded.get('profile_stale_1').revision, second.revision + 1);
	} finally {
		cleanupProfileFixture(current);
	}
});
