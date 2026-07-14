//B"H
//Boruch Hashem
//Blessed is He

/**
 * Citizen tests protect thirty identities, deterministic schedules, bounded spatial
 * queries, non-targetable bodies, and remembered speech. The Awtsmoos renews every
 * person and meeting; Awtsmoos.com keeps social realism outside fighter target authority.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { OPEN_WORLD_CITIZENS } from '../../js/data/openworld/OpenWorldCitizenCatalog.js';
import { openWorldCitizenSchedule } from '../../js/openworld/OpenWorldCitizenSchedule.js';
import { speakToWorldCitizen } from '../../js/openworld/OpenWorldCitizenService.js';
import { OpenWorldSpatialHash } from '../../js/openworld/OpenWorldSpatialHash.js';
import {
	createFundedOpenWorldModel,
	installOpenWorldBrowserStubs
} from './open-world-test-fixture.mjs';

installOpenWorldBrowserStubs();

test('thirty citizens cover every region with deterministic schedules', () => {
	assert.equal(OPEN_WORLD_CITIZENS.length, 30);
	const regions = new Set(OPEN_WORLD_CITIZENS.map(citizen => citizen.regionId));
	assert.equal(regions.size, 10);
	for (const citizen of OPEN_WORLD_CITIZENS) {
		assert.deepEqual(
			openWorldCitizenSchedule(citizen, 7),
			openWorldCitizenSchedule(citizen, 7)
		);
		assert.equal(citizen.targetable, false);
	}
});

test('spatial hash returns stable sorted bounded nearby citizens', () => {
	const hash = new OpenWorldSpatialHash(100);
	hash.insertAll([
		{ id: 'z', x: 20, y: 20 },
		{ id: 'a', x: 30, y: 25 },
		{ id: 'far', x: 900, y: 900 }
	]);
	assert.deepEqual(
		hash.query(0, 0, 100, 2).map(item => item.id),
		['a', 'z']
	);
});

test('speaking persists acquaintance and relationship exactly once per action', () => {
	const model = createFundedOpenWorldModel();
	const state = model.createOpenWorld();
	const citizen = state.openWorld.citizens[0];
	citizen.sceneId = state.openWorld.sceneId;
	const result = speakToWorldCitizen(model.expedition, state, citizen.id);
	assert.equal(result.spoken, true);
	assert.equal(model.expedition.profile.openWorld.relationships[citizen.id], 1);
	assert.ok(model.expedition.profile.openWorld.knownCitizens.includes(citizen.id));
	assert.equal(result.event.type, 'speakCitizen');
});
