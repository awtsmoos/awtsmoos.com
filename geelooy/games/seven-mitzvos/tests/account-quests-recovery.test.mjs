//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { AccountActionService } from '../js/realm/account/account-action-service.js';
import { AchievementService } from '../js/realm/account/achievement-service.js';
import { CollectionService } from '../js/realm/account/collection-service.js';
import { QuestService } from '../js/realm/account/quest-service.js';
import { RecoveryService } from '../js/realm/account/recovery-service.js';
import { TravelService } from '../js/realm/account/travel-service.js';
import { createRealmState } from '../js/realm/realm-state.js';

/**
 * @module AccountQuestsRecoveryTest
 * @description
 * Authored stories, discovery, danger, recovery, and earned travel must change one
 * persistent identity exactly once. The Awtsmoos joins every chapter while
 * Awtsmoos.com protects skill, bank, equipment, and quest truth through danger.
 */
test('ordered bridge quest completes once and grants enduring rewards', () => {
	const quests = new QuestService();
	let state = quests.start(createRealmState(), 'bridge-of-trust').state;
	for (const action of ['talk:realm-person-1', 'bridge:timber', 'bridge:timber', 'bridge:stone', 'bridge:stone']) {
		state = quests.advance(state, action).state;
	}
	assert.ok(state.quests.completed.includes('bridge-of-trust'));
	assert.equal(state.account.questPoints, 2);
	assert.equal(state.account.title, 'Bridge Helper');
	assert.ok(state.travel.unlocked.includes('river-ferry'));
	assert.ok(state.player.itemIds.some(id => state.items[id].definitionId === 'bridgewright-gloves'));
	const itemCount = state.player.itemIds.length;
	state = quests.advance(state, 'bridge:stone').state;
	assert.equal(state.account.questPoints, 2);
	assert.equal(state.player.itemIds.length, itemCount);
});

test('collections remain unique and bounded', () => {
	const collections = new CollectionService();
	let state = createRealmState();
	state = collections.record(state, 'people', 'realm-person-1');
	state = collections.record(state, 'people', 'realm-person-1');
	assert.equal(state.collections.people.length, 1);
	for (let index = 0; index < 55; index += 1) state = collections.record(state, 'places', `place-${index}`);
	assert.equal(state.collections.places.length, 40);
	assert.equal(state.collections.places[0], 'place-15');
});

test('achievements are breadth-based and idempotent', () => {
	const achievements = new AchievementService();
	let state = { ...createRealmState(), actionCount: 1 };
	state = achievements.evaluate(state).state;
	assert.ok(state.achievements.includes('first-consequence'));
	const count = state.achievements.length;
	state = achievements.evaluate(state).state;
	assert.equal(state.achievements.length, count);
});

test('downing preserves skill, bank, equipment, quests, and returns protected cache', () => {
	const recovery = new RecoveryService();
	let state = createRealmState();
	state = { ...state, quests: { ...state.quests, completed: ['bridge-of-trust'] } };
	const snapshot = JSON.stringify({ skills: state.player.skills, bank: state.bank, equipment: state.equipment, quests: state.quests });
	const downed = recovery.damage(state, 200, 'rockfall').state;
	assert.equal(downed.vitals.downed, true);
	assert.ok(downed.vitals.recoveryCache);
	assert.equal(JSON.stringify({ skills: downed.player.skills, bank: downed.bank, equipment: downed.equipment, quests: downed.quests }), snapshot);
	const recovered = recovery.recoverAtHome(downed).state;
	assert.equal(recovered.vitals.health, 100);
	assert.equal(recovered.vitals.downed, false);
	assert.equal(recovered.account.recoveryCount, 1);
});

test('nonlethal negotiation avoids injury and unlocks the continuous north road', () => {
	const actions = new AccountActionService();
	const travel = new TravelService();
	let state = createRealmState();
	state = actions.handle(state, 'encounter:negotiate').state;
	assert.equal(state.vitals.injury, 'none');
	assert.equal(state.encounter.roadThreat.active, false);
	assert.ok(state.travel.unlocked.includes('north-road'));
	state = travel.travel(state, 'north-road').state;
	assert.deepEqual(state.player.position, { x: 0, z: -10 });
	assert.equal(state.travel.currentRegion, 'north-road');
});
