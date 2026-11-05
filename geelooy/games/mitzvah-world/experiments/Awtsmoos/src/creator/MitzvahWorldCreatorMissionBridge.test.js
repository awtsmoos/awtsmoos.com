// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldCreatorMissionBridge.test.js
 * @description Proves player-authored missions publish into (and unpublish from)
 * a live adventure store, becoming offerable and acceptable like catalog missions.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from '../gameplay/AdventureStore.js';
import {
	publishPlayerMission,
	unpublishPlayerMission
} from './MitzvahWorldCreatorMissionBridge.js';

function draft() {
	return {
		description: 'Light the beacons along the road.',
		giverName: 'Elder Miriam',
		objectives: [
			{ type: 'visit', target: 'north-beacon', count: 1, description: 'Reach the north beacon.', x: 20, z: -30 }
		],
		title: 'Beacons of the Road',
		x: 0,
		z: 0
	};
}

test('publishPlayerMission registers a playable quest in the adventure store', () => {
	const store = new AdventureStore();
	const before = store.snapshot().available.length;
	const quest = publishPlayerMission(store, draft());
	assert.ok(quest.id.startsWith('player-mission-'));
	assert.equal(quest.name, 'Beacons of the Road');
	assert.equal(store.snapshot().available.length, before + 1);
	const offered = store.offer(quest.id);
	assert.equal(offered.status, 'offered');
	const accepted = store.accept(quest.id);
	assert.equal(accepted.status, 'active');
});

test('publishPlayerMission requires a real store', () => {
	assert.throws(() => publishPlayerMission(null, draft()), /MISSION_BRIDGE_STORE_REQUIRED/);
	assert.throws(() => publishPlayerMission({}, draft()), /MISSION_BRIDGE_STORE_REQUIRED/);
});

test('unpublishPlayerMission removes the quest', () => {
	const store = new AdventureStore();
	const quest = publishPlayerMission(store, draft());
	assert.equal(unpublishPlayerMission(store, quest.id), true);
	assert.equal(store.get(quest.id), null);
	assert.equal(unpublishPlayerMission(store, 'no-such-quest'), false);
});

test('registerQuest refuses duplicates and invalid definitions', () => {
	const store = new AdventureStore();
	const quest = publishPlayerMission(store, draft());
	assert.throws(() => store.registerQuest(quest), /ADVENTURE_QUEST_EXISTS/);
	assert.throws(() => store.registerQuest(null), /ADVENTURE_QUEST_INVALID/);
	assert.throws(() => store.registerQuest({ id: 'x' }), /ADVENTURE_QUEST_MISSING/);
});
