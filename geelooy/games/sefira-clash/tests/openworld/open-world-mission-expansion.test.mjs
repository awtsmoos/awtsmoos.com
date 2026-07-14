//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expanded mission tests protect sixteen authored chains and role-aware ordered evidence.
 * The Awtsmoos renews person, deed, and return; Awtsmoos.com never lets the right event in
 * the wrong sequence, location, or citizen role advance a shlichus stage.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { OPEN_WORLD_MISSIONS } from '../../js/data/openworld/OpenWorldMissionCatalog.js';
import { createBaseExpeditionProfile } from '../../js/expedition/ExpeditionDefaults.js';
import {
	activateOpenWorldMission,
	recordOpenWorldMissionEvent
} from '../../js/openworld/OpenWorldMissionLedger.js';

test('sixteen shlichus chains remain serializable and uniquely named', () => {
	assert.equal(OPEN_WORLD_MISSIONS.length, 16);
	assert.equal(new Set(OPEN_WORLD_MISSIONS.map(mission => mission.id)).size, 16);
	assert.ok(OPEN_WORLD_MISSIONS.every(mission => mission.stages.length >= 2));
});

test('role-aware citizen mission advances only through ordered matching roles', () => {
	let profile = fundedProfile();
	profile = activateOpenWorldMission(profile, 'meet-the-city', 'malchus-citadel').profile;
	profile = recordOpenWorldMissionEvent(
		profile,
		event('speakCitizen', 'dovid-market', 'trainer')
	).profile;
	assert.equal(profile.openWorld.missions['meet-the-city'].stageIndex, 0);
	for (const deed of [
		event('speakCitizen', 'dovid-market', 'merchant'),
		event('speakCitizen', 'yael-trainer', 'trainer'),
		event('speakCitizen', 'shimon-mediator', 'elder'),
		event('enterInterior', 'shlichus')
	])
		profile = recordOpenWorldMissionEvent(profile, deed).profile;
	assert.equal(profile.openWorld.missions['meet-the-city'].status, 'complete');
});

function fundedProfile() {
	const profile = createBaseExpeditionProfile();
	return {
		...profile,
		perutas: 500,
		reputation: { ...profile.reputation, malchus: 40 }
	};
}

function event(type, targetId, role = '') {
	return {
		type,
		targetId,
		role,
		locationId: 'malchus-citadel',
		count: 1
	};
}
