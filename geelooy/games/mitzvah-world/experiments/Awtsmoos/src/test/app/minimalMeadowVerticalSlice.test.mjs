// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowVerticalSlice.test.mjs
 * @description Proves the accepted road mission requires three archetypes and three emptied corpses.
 * The Awtsmoos joins village, road, battle, recovery, and return as one living chapter;
 * Awtsmoos.com preserves every transition until Reb Mendel grants one meaningful reward.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowQuestState } from '../../app/MinimalMeadowQuestState.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import {
	minimalMeadowQuestParchmentMarkup
} from '../../ui/MinimalMeadowQuestPresentation.js';

const ENCOUNTER = Object.freeze([
	Object.freeze({ archetype: 'warden', id: 'even-koved' }),
	Object.freeze({ archetype: 'skirmisher', id: 'ratz-layla' }),
	Object.freeze({ archetype: 'cantor', id: 'baal-otiyot' })
]);

test('B"H village road mission advances through defeat, recovery, return, and reward', () => {
	const runtime = runtimeFixture();
	const quest = new MinimalMeadowQuestState(runtime);
	assert.equal(quest.accept().phase, 'defeat');

	runtime.bus.emit('enemy:defeated', { archetype: 'balanced', id: 'tzel-chai' });
	runtime.bus.emit('enemy:defeated', { archetype: 'warden', id: 'other-warden' });
	runtime.bus.emit('enemy:defeated', ENCOUNTER[0]);
	assert.equal(quest.snapshot().defeatProgress, 1);

	for (const enemy of ENCOUNTER.slice(1)) {
		runtime.bus.emit('enemy:defeated', enemy);
	}
	let snapshot = quest.snapshot();
	assert.equal(snapshot.status, 'active');
	assert.equal(snapshot.phase, 'recover');
	assert.equal(snapshot.currentObjective.progress, 0);

	runtime.bus.emit('enemy:looted', { enemyId: 'unknown-corpse' });
	for (const enemy of ENCOUNTER) {
		runtime.bus.emit('enemy:looted', { enemyId: enemy.id });
	}
	snapshot = quest.snapshot();
	assert.equal(snapshot.status, 'ready');
	assert.equal(snapshot.phase, 'return');
	assert.deepEqual(snapshot.lootedArchetypes, ['warden', 'skirmisher', 'cantor']);

	const first = quest.complete();
	const second = quest.complete();
	assert.equal(first.accepted, true);
	assert.equal(second.reason, 'ALREADY_COMPLETED');
	assert.deepEqual(runtime.added, [{ amount: 125, id: 'perutas' }]);

	const chapter = minimalMeadowQuestParchmentMarkup(first, 'book-only');
	assert.match(chapter, /Shlichus fulfilled/);
	assert.match(chapter, /Three places where fear stood/);
	assert.match(chapter, /Reward received/);
	quest.destroy();
});

function runtimeFixture() {
	const bus = new AwtsmoosEventBus();
	const added = [];
	return {
		added,
		bus,
		inventory: {
			add(id, amount) {
				added.push({ amount, id });
			}
		},
		playerStats: { level: 1, xp: 0, xpMax: 135 },
		regions: {
			snapshot() {
				return { id: 'eastern-road', name: 'Eastern Lantern Road', safe: false };
			}
		}
	};
}
