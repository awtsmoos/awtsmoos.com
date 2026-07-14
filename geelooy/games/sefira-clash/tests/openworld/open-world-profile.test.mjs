//B"H
//Boruch Hashem
//Blessed is He

/**
 * Profile tests protect schema migration, bounded civic/social state, conflict-safe
 * mission and technique progress, and server parity. The Awtsmoos renews local and remote
 * memory; Awtsmoos.com rejects invented citizens, rooms, missions, ranks, and VS stats.
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import { createBaseExpeditionProfile } from '../../js/expedition/ExpeditionDefaults.js';
import { mergeExpeditionProfiles } from '../../js/expedition/ExpeditionProfileMerge.js';
import { sanitizeExpeditionProfile } from '../../js/expedition/ExpeditionProfile.js';

const require = createRequire(import.meta.url);
const {
	sanitizeExpeditionServerProfile
} = require('../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/sefiraClash/ExpeditionProfileSchema.js');

test('existing schema-v2 saves receive safe lived-world and social defaults', () => {
	const profile = sanitizeExpeditionProfile({
		version: 2,
		xp: 400,
		perutas: 20,
		discovered: ['malchus-citadel'],
		inventory: ['training-sword']
	});
	assert.equal(profile.openWorld.techniques.punchRank, 1);
	assert.equal(profile.openWorld.techniques.kickRank, 1);
	assert.equal(profile.openWorld.civicTitle, 'New Shaliach');
	assert.deepEqual(profile.openWorld.missions, {});
	assert.deepEqual(profile.openWorld.relationships, {});
	assert.deepEqual(profile.openWorld.knownCitizens, []);
});

test('profile merge preserves permanent social progress and newer mutable state', () => {
	const base = createBaseExpeditionProfile();
	const local = profileVariant(base, 2, {
		techniques: { punchRank: 3, kickRank: 1, mastery: { 'measured-jab': 4 } },
		knownDoors: ['malchus-citadel:market'],
		knownCitizens: ['malka-board'],
		relationships: { 'malka-board': 4 },
		discoveredShortcuts: ['malchus-citadel:ladder:3'],
		provisions: { ...base.openWorld.provisions, meal: 5 }
	});
	const remote = profileVariant(base, 4, {
		techniques: { punchRank: 1, kickRank: 3, mastery: { 'front-gate-kick': 8 } },
		knownDoors: ['malchus-citadel:training'],
		knownCitizens: ['dovid-market'],
		relationships: { 'dovid-market': 6 },
		discoveredShortcuts: ['malchus-citadel:lift:6'],
		provisions: { ...base.openWorld.provisions, meal: 1, tea: 2 }
	});
	const merged = mergeExpeditionProfiles(local, remote);
	assert.equal(merged.openWorld.techniques.punchRank, 3);
	assert.equal(merged.openWorld.techniques.kickRank, 3);
	assert.equal(merged.openWorld.provisions.meal, 1);
	assert.deepEqual(
		new Set(merged.openWorld.knownCitizens),
		new Set(['malka-board', 'dovid-market'])
	);
	assert.equal(merged.openWorld.relationships['malka-board'], 4);
	assert.ok(merged.openWorld.discoveredShortcuts.includes('malchus-citadel:lift:6'));
});

test('server sanitation bounds expanded missions, citizens, doors, and ranks', () => {
	const profile = sanitizeExpeditionServerProfile({
		openWorld: {
			missions: {
				'meet-the-city': missionState(),
				'invented-mission': missionState()
			},
			techniques: { punchRank: 99, kickRank: -5, mastery: { 'measured-jab': 7 } },
			knownDoors: ['malchus-citadel:archive', 'invented-place:armory'],
			knownCitizens: ['malka-board', 'invented-citizen'],
			relationships: { 'malka-board': 200, 'invented-citizen': 8 },
			provisions: { meal: 3, weapon: 999 }
		}
	});
	assert.equal(profile.openWorld.techniques.punchRank, 3);
	assert.equal(profile.openWorld.techniques.kickRank, 1);
	assert.ok(profile.openWorld.missions['meet-the-city']);
	assert.equal(profile.openWorld.missions['invented-mission'], undefined);
	assert.deepEqual(profile.openWorld.knownDoors, ['malchus-citadel:archive']);
	assert.deepEqual(profile.openWorld.knownCitizens, ['malka-board']);
	assert.equal(profile.openWorld.relationships['malka-board'], 99);
	assert.equal(profile.openWorld.provisions.weapon, undefined);
});

function profileVariant(base, revision, openWorld) {
	return {
		...base,
		openWorld: { ...base.openWorld, ...openWorld },
		sync: { profileId: 'profile_world_1', revision, syncedAt: revision * 100 }
	};
}

function missionState() {
	return {
		status: 'active',
		stageIndex: 2,
		progress: 0,
		locationId: 'malchus-citadel'
	};
}
