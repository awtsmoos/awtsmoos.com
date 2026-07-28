// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowQuestCompletion.test.mjs
 * @description Proves archetype uniqueness, required recovery, exact-once reward, and menu priority.
 * The Awtsmoos remembers three revealed forms and three emptied vessels without multiplying reward;
 * Awtsmoos.com keeps defeat, recovery, return, testimony, and the current Shlichus aligned.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowQuestState } from '../../app/MinimalMeadowQuestState.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';
import {
	minimalMeadowShlichusMenuContent
} from '../../ui/MinimalMeadowMenuShlichus.js';
import {
	minimalMeadowQuestParchmentMarkup
} from '../../ui/MinimalMeadowQuestPresentation.js';

const ENCOUNTER = Object.freeze([
	Object.freeze({ archetype: 'warden', id: 'even-koved' }),
	Object.freeze({ archetype: 'skirmisher', id: 'ratz-layla' }),
	Object.freeze({ archetype: 'cantor', id: 'baal-otiyot' })
]);

test('B"H three archetypes and three emptied corpses grant one completion chapter', () => {
	const runtime = runtimeFixture();
	const quest = new MinimalMeadowQuestState(runtime);
	quest.accept();
	runtime.bus.emit('enemy:defeated', { archetype: 'balanced', id: 'tzel-chai' });
	runtime.bus.emit('enemy:defeated', { archetype: 'warden', id: 'other-warden' });
	runtime.bus.emit('enemy:defeated', ENCOUNTER[0]);
	assert.equal(quest.snapshot().defeatProgress, 1);
	for (const enemy of ENCOUNTER.slice(1)) runtime.bus.emit('enemy:defeated', enemy);
	assert.equal(quest.snapshot().phase, 'recover');
	assert.equal(quest.complete().reason, 'NOT_READY');
	runtime.bus.emit('enemy:looted', { enemyId: 'unknown-corpse' });
	for (const enemy of ENCOUNTER) runtime.bus.emit('enemy:looted', { enemyId: enemy.id });
	assert.equal(quest.snapshot().status, 'ready');
	assert.equal(quest.snapshot().phase, 'return');
	const first = quest.complete();
	const second = quest.complete();
	assert.equal(first.accepted, true);
	assert.equal(second.reason, 'ALREADY_COMPLETED');
	assert.deepEqual(runtime.added, [{ amount: 125, id: 'perutas' }]);
	assert.equal(runtime.playerStats.level, 2);
	const markup = minimalMeadowQuestParchmentMarkup(quest.snapshot(), 'book-only');
	assert.match(markup, /Shlichus fulfilled/);
	assert.match(markup, /Three places where fear stood/);
	assert.match(markup, /Reward received/);
	assert.match(markup, /Continue with the light/);
	quest.destroy();
});

test('B"H menu prioritizes the changing dedicated mission over unrelated adventure', () => {
	const runtime = runtimeFixture();
	const quest = new MinimalMeadowQuestState(runtime);
	runtime.quest = quest;
	runtime.adventures = unrelatedAdventureStore();
	quest.accept();
	for (const enemy of ENCOUNTER) runtime.bus.emit('enemy:defeated', enemy);
	let content = minimalMeadowShlichusMenuContent(runtime);
	assert.match(content.body, /Three Shadows Before Sunset/);
	assert.match(content.body, /Open and empty each required demon corpse/);
	assert.doesNotMatch(content.body, /Unrelated adventure/);
	for (const enemy of ENCOUNTER) runtime.bus.emit('enemy:looted', { enemyId: enemy.id });
	content = minimalMeadowShlichusMenuContent(runtime);
	assert.match(content.body, /Ready to return/);
	assert.match(content.body, /Return to Reb Mendel/);
	quest.destroy();
});

function runtimeFixture() {
	const bus = new AwtsmoosEventBus();
	const added = [];
	return {
		added,
		bus,
		inventory: { add(id, amount) { added.push({ amount, id }); } },
		playerStats: { level: 1, xp: 0, xpMax: 135 },
		regions: { snapshot() { return { id: 'eastern-road', safe: false }; } }
	};
}

function unrelatedAdventureStore() {
	return {
		snapshot() {
			return { active: [{ definition: { title: 'Unrelated adventure' } }] };
		}
	};
}
