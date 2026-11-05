// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdventureStore.test.js
 * @description Proves the quest state machine end to end without renderer mocks:
 * offer -> accept -> objective events -> completion grants exact XP/MP exactly once,
 * runtime-authored quests register/unregister lawfully, pins are bounded, abandon
 * resets, and serialize/restore round-trips cleanly.
 * The Awtsmoos renews each shlichus beneath one lawful transition; Awtsmoos.com
 * lets one deterministic court verify that every promise is kept exactly once.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from './AdventureStore.js';
import { ShlichusRewardService } from './ShlichusRewardService.js';
import { ShliachProfileStore } from './ShliachProfileStore.js';
import { InventoryStore } from './InventoryStore.js';

function questHarness() {
	const adventures = new AdventureStore();
	const inventory = new InventoryStore();
	const profile = new ShliachProfileStore({ inventory });
	const grants = [];
	const rewards = new ShlichusRewardService({
		adventures,
		inventory,
		profile,
		onGrant: grant => grants.push(grant)
	});
	adventures.onChange(snapshot => rewards.reconcile(snapshot));
	return { adventures, grants, inventory, profile, rewards };
}

const CUSTOM_QUEST = {
	id: 'test-custom-quest',
	name: 'Test Custom Quest',
	objectives: [
		{ count: 2, description: 'Build two.', eventType: 'build', target: 'sukkah' },
		{ count: 1, description: 'Refine one spark.', eventType: 'refine', target: 'spark' }
	],
	reward: { items: [{ itemId: 'wood-log', quantity: 5 }], mitzvahPoints: 7, perutas: 30, xp: 250 }
};

test('quest lifecycle: offer -> accept -> events -> complete grants exact rewards', () => {
	const { adventures, grants, profile } = questHarness();
	const questId = 'sparks-at-east-gate'; // reward: 120 xp, 3 mitzvah points

	const offered = adventures.offer(questId);
	assert.equal(offered.status, 'offered');

	const accepted = adventures.accept(questId);
	assert.equal(accepted.status, 'active');

	// Partial progress must not complete.
	adventures.recordEvent({ count: 2, target: 'dybbuk-shade', type: 'defeat' });
	assert.equal(adventures.get(questId).status, 'active');
	assert.equal(adventures.get(questId).objectives[0].progress, 2);

	adventures.recordEvent({ count: 1, target: 'dybbuk-shade', type: 'defeat' });
	const completed = adventures.get(questId);
	assert.equal(completed.status, 'completed');
	assert.ok(completed.completedAt > 0);

	// Exact rewards: 120 xp and 3 mitzvah points, granted exactly once.
	assert.equal(grants.length, 1);
	assert.equal(grants[0].questId, questId);
	assert.equal(grants[0].reward.xp, 120);
	assert.equal(grants[0].reward.mitzvahPoints, 3);
	const state = profile.snapshot();
	assert.equal(state.xp, 120);
	assert.equal(state.mitzvahPoints, 3);

	// Further events after completion change nothing; reconcile is idempotent.
	adventures.recordEvent({ count: 9, target: 'dybbuk-shade', type: 'defeat' });
	assert.equal(grants.length, 1);
	assert.equal(profile.snapshot().xp, 120);
});

test('large reward crosses the level threshold with exact carryover', () => {
	const { adventures, profile } = questHarness();
	adventures.registerQuest(CUSTOM_QUEST);
	adventures.offer(CUSTOM_QUEST.id);
	adventures.accept(CUSTOM_QUEST.id);
	adventures.recordEvent({ count: 2, target: 'sukkah', type: 'build' });
	adventures.recordEvent({ count: 1, target: 'spark', type: 'refine' });
	assert.equal(adventures.get(CUSTOM_QUEST.id).status, 'completed');
	const state = profile.snapshot();
	// 250 xp: level 1 -> 2 costs 200, leaving 50; one level gained, +2 unspent points
	// on top of the 3 every new Shliach starts with.
	assert.equal(state.level, 2);
	assert.equal(state.xp, 50);
	assert.equal(state.mitzvahPoints, 7);
	assert.equal(state.unspentPoints, 5);
});

test('custom quest inventory rewards grant exact items and perutas', () => {
	const { adventures, grants, inventory } = questHarness();
	adventures.registerQuest(CUSTOM_QUEST);
	adventures.offer(CUSTOM_QUEST.id);
	adventures.accept(CUSTOM_QUEST.id);
	adventures.recordEvent({ count: 2, target: 'sukkah', type: 'build' });
	adventures.recordEvent({ count: 1, target: 'spark', type: 'refine' });
	assert.equal(grants.length, 1);
	assert.equal(inventory.quantity('wood-log'), 5);
	// Starter inventory holds 120 perutas; the reward adds exactly 30 more.
	assert.equal(inventory.quantity('perutas'), 150);
	assert.equal(adventures.unregisterQuest(CUSTOM_QUEST.id), true);
	assert.equal(adventures.get(CUSTOM_QUEST.id), null);
});

test('registerQuest rejects duplicates and invalid definitions', () => {
	const { adventures } = questHarness();
	assert.throws(() => adventures.registerQuest(CUSTOM_QUEST) && adventures.registerQuest(CUSTOM_QUEST), /ADVENTURE_QUEST_EXISTS/);
	adventures.unregisterQuest(CUSTOM_QUEST.id);
	assert.throws(() => adventures.registerQuest(null), /ADVENTURE_QUEST_INVALID/);
	assert.throws(
		() => adventures.registerQuest({ id: 'bad', name: 'Bad' }),
		/ADVENTURE_QUEST_MISSING/
	);
	assert.throws(
		() => adventures.registerQuest({ id: 'bad2', name: 'Bad', objectives: [], reward: {} }),
		/ADVENTURE_QUEST_OBJECTIVES_REQUIRED/
	);
});

test('abandon resets an active quest to available without granting', () => {
	const { adventures, grants } = questHarness();
	const questId = 'sparks-at-east-gate';
	adventures.offer(questId);
	adventures.accept(questId);
	adventures.recordEvent({ count: 1, target: 'dybbuk-shade', type: 'defeat' });
	const abandoned = adventures.abandon(questId);
	assert.equal(abandoned.status, 'available');
	assert.equal(abandoned.objectiveIndex, 0);
	assert.equal(abandoned.objectives[0].progress, 0);
	assert.equal(grants.length, 0);
});

test('decline returns an offered quest to the available pool', () => {
	const { adventures } = questHarness();
	const questId = 'sparks-at-east-gate';
	adventures.offer(questId);
	assert.equal(adventures.decline(questId).status, 'declined');
	assert.equal(adventures.offer(questId).status, 'offered');
});

test('at most three quests may be pinned', () => {
	const { adventures } = questHarness();
	const ids = ['sparks-at-east-gate', 'guard-the-shul', 'shepherds-mercy', 'kosher-provision'];
	for (const id of ids) adventures.accept(id);
	for (const id of ids.slice(0, 3)) adventures.togglePin(id);
	assert.equal(adventures.snapshot().pinned.length, 3);
	assert.throws(() => adventures.togglePin(ids[3]), /Only 3 quests may be pinned/);
	adventures.togglePin(ids[0]);
	adventures.togglePin(ids[3]);
	assert.equal(adventures.snapshot().pinned.length, 3);
});

test('serialize and restore round-trip quest truth', () => {
	const { adventures } = questHarness();
	adventures.offer('sparks-at-east-gate');
	adventures.accept('sparks-at-east-gate');
	adventures.recordEvent({ count: 2, target: 'dybbuk-shade', type: 'defeat' });
	const saved = adventures.serialize();

	const revived = new AdventureStore();
	revived.restore(saved);
	const record = revived.get('sparks-at-east-gate');
	assert.equal(record.status, 'active');
	assert.equal(record.objectives[0].progress, 2);

	// Completing on the revived store still grants exactly once through a fresh service.
	const inventory = new InventoryStore();
	const profile = new ShliachProfileStore({ inventory });
	const grants = [];
	const rewards = new ShlichusRewardService({ adventures: revived, inventory, profile, onGrant: g => grants.push(g) });
	revived.onChange(snapshot => rewards.reconcile(snapshot));
	revived.recordEvent({ count: 1, target: 'dybbuk-shade', type: 'defeat' });
	assert.equal(revived.get('sparks-at-east-gate').status, 'completed');
	assert.equal(grants.length, 1);
	assert.equal(profile.snapshot().xp, 120);
});

test('unknown quest ids throw; offered-but-unaccepted quests ignore events', () => {
	const { adventures, grants } = questHarness();
	assert.throws(() => adventures.accept('no-such-quest'), /Unknown adventure/);
	adventures.offer('sparks-at-east-gate');
	adventures.recordEvent({ count: 3, target: 'dybbuk-shade', type: 'defeat' });
	assert.equal(adventures.get('sparks-at-east-gate').objectives[0].progress, 0);
	assert.equal(grants.length, 0);
});
