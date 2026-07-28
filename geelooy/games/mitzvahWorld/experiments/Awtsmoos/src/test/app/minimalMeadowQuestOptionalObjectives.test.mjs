// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowQuestOptionalObjectives.test.mjs
 * @description Proves learning and an unbroken return enrich but never replace required recovery.
 * The Awtsmoos lets optional excellence crown a completed duty without becoming its gate;
 * Awtsmoos.com preserves one reward receipt and one truth across parchment and mission book.
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

test('B"H optional excellence grants one XP bonus and renders everywhere', () => {
	const runtime = runtimeFixture();
	const quest = new MinimalMeadowQuestState(runtime);
	runtime.quest = quest;
	quest.accept();
	for (const id of ['teaching-one', 'teaching-two']) {
		runtime.bus.emit('teaching:answered', { correct: true, id });
	}
	defeatAndRecover(runtime);
	const first = quest.complete();
	const second = quest.complete();
	assert.equal(first.accepted, true);
	assert.equal(second.reason, 'ALREADY_COMPLETED');
	assert.deepEqual(runtime.added, [{ amount: 125, id: 'perutas' }]);
	assert.deepEqual(first.completionReceipt.optionalReward, { perutas: 0, xp: 35 });
	assert.equal(first.completionReceipt.xp, 210);
	assert.equal(first.completionReceipt.perutas, 125);
	assert.deepEqual(first.completionReceipt.honors, ['Unbroken Lantern']);
	assert.equal(first.optionalObjectives.length, 2);
	assert.ok(first.optionalObjectives.every(objective => objective.complete));
	const parchment = minimalMeadowQuestParchmentMarkup(first, 'book-only');
	const menu = minimalMeadowShlichusMenuContent(runtime).body;
	for (const markup of [parchment, menu]) {
		assert.match(markup, /Optional excellence/);
		assert.match(markup, /Unbroken Lantern/);
		assert.match(markup, /\+35 bonus XP/);
		assert.doesNotMatch(markup, /bonus perutas/);
	}
	quest.destroy();
});

test('B"H player defeat removes only the honor and never blocks base completion', () => {
	const runtime = runtimeFixture();
	const quest = new MinimalMeadowQuestState(runtime);
	quest.accept();
	runtime.bus.emit('player:defeated', { reason: 'test' });
	defeatAndRecover(runtime);
	const receipt = quest.complete();
	assert.equal(receipt.accepted, true);
	assert.deepEqual(runtime.added, [{ amount: 125, id: 'perutas' }]);
	assert.deepEqual(receipt.completionReceipt.honors, []);
	assert.deepEqual(receipt.completionReceipt.optionalReward, { perutas: 0, xp: 0 });
	assert.equal(receipt.optionalObjectives[0].complete, false);
	assert.equal(receipt.optionalObjectives[1].complete, false);
	quest.destroy();
});

function defeatAndRecover(runtime) {
	for (const enemy of ENCOUNTER) runtime.bus.emit('enemy:defeated', enemy);
	for (const enemy of ENCOUNTER) runtime.bus.emit('enemy:looted', { enemyId: enemy.id });
}

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
