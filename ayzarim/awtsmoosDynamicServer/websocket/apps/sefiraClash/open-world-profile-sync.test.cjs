//B"H
//Boruch Hashem
//Blessed is He

/**
 * Open-world sync tests protect restart persistence, lawful provision spending, and
 * stale civic conflict merge. The Awtsmoos renews local and remote city memory;
 * Awtsmoos.com must preserve shlichus, ranks, doors, mastery, and measured positions.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { ExpeditionProfileController } = require('./ExpeditionProfileController.js');
const { ExpeditionProfileRepository } = require('./ExpeditionProfileRepository.js');

function fixture() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sefira-open-world-'));
	const filePath = path.join(directory, 'profiles.json');
	const repository = new ExpeditionProfileRepository(filePath);
	return {
		controller: new ExpeditionProfileController(repository),
		directory,
		filePath
	};
}

function profile(overrides = {}) {
	return {
		xp: 500,
		perutas: 100,
		discovered: ['malchus-citadel'],
		inventory: ['training-sword'],
		activeLocationId: 'malchus-citadel',
		openWorld: {
			missions: {
				'city-circuit': {
					status: 'active',
					stageIndex: 2,
					progress: 0,
					locationId: 'malchus-citadel'
				}
			},
			techniques: {
				punchRank: 2,
				kickRank: 1,
				mastery: { 'measured-jab': 4 }
			},
			provisions: { meal: 5, tea: 1 },
			knownDoors: ['malchus-citadel:market'],
			lastStreetPositions: {
				'malchus-citadel': { x: 140, y: 500 }
			},
			rumors: ['malchus-citadel: A real deed advances shlichus.'],
			encountersResolved: 1,
			rests: 1,
			civicTitle: 'Neighborhood Shaliach'
		},
		...overrides
	};
}

test('lived-city profile survives repository restart', () => {
	const current = fixture();
	const pushed = current.controller.push({
		profileId: 'open_world_restart_1',
		baseRevision: 0,
		profile: profile()
	});
	const reloaded = new ExpeditionProfileRepository(current.filePath);
	const stored = reloaded.get('open_world_restart_1').profile;
	assert.equal(pushed.profile.openWorld.techniques.punchRank, 2);
	assert.equal(stored.openWorld.missions['city-circuit'].stageIndex, 2);
	assert.equal(stored.openWorld.lastStreetPositions['malchus-citadel'].x, 140);
	fs.rmSync(current.directory, { recursive: true, force: true });
});

test('current revision permits spending while stale civic progress cannot regress', () => {
	const current = fixture();
	const first = current.controller.push({
		profileId: 'open_world_merge_1',
		baseRevision: 0,
		profile: profile()
	});
	const spent = current.controller.push({
		profileId: 'open_world_merge_1',
		baseRevision: first.revision,
		profile: profile({
			openWorld: {
				...first.profile.openWorld,
				provisions: { ...first.profile.openWorld.provisions, meal: 2 }
			}
		})
	});
	assert.equal(spent.profile.openWorld.provisions.meal, 2);
	const stale = current.controller.push({
		profileId: 'open_world_merge_1',
		baseRevision: first.revision,
		profile: profile({
			openWorld: {
				...first.profile.openWorld,
				techniques: { punchRank: 2, kickRank: 3, mastery: {} },
				knownDoors: ['malchus-citadel:training'],
				provisions: { meal: 8 }
			}
		})
	});
	assert.equal(stale.merged, true);
	assert.equal(stale.profile.openWorld.techniques.kickRank, 3);
	assert.equal(stale.profile.openWorld.provisions.meal, 8);
	assert.ok(stale.profile.openWorld.knownDoors.includes('malchus-citadel:market'));
	assert.ok(stale.profile.openWorld.knownDoors.includes('malchus-citadel:training'));
	fs.rmSync(current.directory, { recursive: true, force: true });
});
