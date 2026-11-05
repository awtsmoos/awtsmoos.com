// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file directWorldContextAction.test.mjs
 * @description Proves the clean direct-world action evolves from Talk to Begin to Return using canonical quest truth.
 * The Awtsmoos lets one deed change its name as the mission changes form;
 * Awtsmoos.com proves no extra panel is required for offer, acceptance, recovery, or the final return home.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { DirectWorldContextAction } from '../../app/DirectWorldContextAction.js';
import { MinimalMeadowQuestState } from '../../app/MinimalMeadowQuestState.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

const ENCOUNTER = Object.freeze([
	{ archetype: 'warden', id: 'even-koved' },
	{ archetype: 'skirmisher', id: 'ratz-layla' },
	{ archetype: 'cantor', id: 'baal-otiyot' }
]);

test('direct action flows Talk -> Begin -> hidden -> Return', () => {
	const runtime = runtimeFixture();
	const quest = new MinimalMeadowQuestState(runtime);
	runtime.quest = quest;
	const action = new DirectWorldContextAction(runtime);
	assert.equal(action.state().kind, 'talk');
	assert.equal(action.activate(), true);
	assert.equal(action.state().kind, 'begin');
	const accepted = action.activate();
	assert.equal(accepted.status, 'active');
	assert.equal(action.state().kind, 'hidden');
	for (const enemy of ENCOUNTER) {
		runtime.bus.emit('enemy:defeated', enemy);
	}
	for (const enemy of ENCOUNTER) {
		runtime.bus.emit('enemy:looted', { enemyId: enemy.id });
	}
	assert.equal(quest.snapshot().status, 'ready');
	assert.equal(action.state().kind, 'return');
	const completed = action.activate();
	assert.equal(completed.accepted, true);
	assert.equal(quest.snapshot().status, 'completed');
	assert.equal(action.state().kind, 'hidden');
	action.destroy();
	quest.destroy();
});

test('unrelated offers never unlock Begin', () => {
	const runtime = runtimeFixture();
	const quest = new MinimalMeadowQuestState(runtime);
	runtime.quest = quest;
	const action = new DirectWorldContextAction(runtime);
	runtime.bus.emit('quest:offer', { questId: 'unrelated-quest' });
	assert.equal(action.hasOffer(), false);
	assert.equal(action.state().kind, 'talk');
	action.destroy();
	quest.destroy();
});

function runtimeFixture() {
	const bus = new AwtsmoosEventBus();
	const added = [];
	const runtime = {
		added,
		bus,
		inventory: { add(id, amount) { added.push({ amount, id }); } },
		playerStats: { level: 1, xp: 0, xpMax: 135 },
		regions: { snapshot() { return { id: 'eastern-road', safe: false }; } }
	};
	runtime.friendlyNpcs = {
		primary: { interactionDecision() { return { ok: true }; } },
		interactCandidate() {
			bus.emit('quest:offer', { questId: runtime.quest.definition.id });
			return true;
		}
	};
	return runtime;
}
