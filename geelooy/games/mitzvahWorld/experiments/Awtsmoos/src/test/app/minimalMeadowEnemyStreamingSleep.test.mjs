// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowEnemyStreamingSleep.test.mjs
 * @description Proves distant sleeping actors retain elapsed numeric state without running rendered actor updates.
 * The Awtsmoos sustains what is hidden without demanding visible motion; Awtsmoos.com lets distant life sleep in numbers,
 * then awaken with accumulated time, so population depth does not become needless frame-by-frame commotion.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowEnemyUpdateBudget } from '../../app/MinimalMeadowEnemyUpdateBudget.js';

test('streaming-sleep actor accumulates time without actor update work', () => {
	const actor = enemy('sleeping');
	actor.streamingSleeping = true;
	const budget = new MinimalMeadowEnemyUpdateBudget(population([actor]));
	budget.update(0.25);
	budget.update(0.25);
	assert.deepEqual(actor.updates, []);
	assert.equal(budget.diagnostics().sleepingSkipped, 2);
	assert.equal(budget.diagnostics().maximumPendingSeconds, 0.5);
});

test('waking actor consumes accumulated time once', () => {
	const actor = enemy('wake');
	actor.streamingSleeping = true;
	const budget = new MinimalMeadowEnemyUpdateBudget(population([actor]));
	budget.update(0.3);
	actor.streamingSleeping = false;
	actor.selected = true;
	budget.update(0.2);
	assert.deepEqual(actor.updates, [0.5]);
	assert.equal(budget.diagnostics().maximumPendingSeconds, 0);
});

test('selected actor is not suppressed by a stale streaming flag', () => {
	const actor = enemy('selected');
	actor.streamingSleeping = true;
	actor.selected = true;
	const budget = new MinimalMeadowEnemyUpdateBudget(population([actor]));
	budget.update(0.1);
	assert.deepEqual(actor.updates, [0.1]);
	assert.equal(budget.diagnostics().sleepingSkipped, 0);
});

test('doubling sleeping population does not create actor update calls', () => {
	const actors = [enemy('one'), enemy('two')];
	for (const actor of actors) actor.streamingSleeping = true;
	const budget = new MinimalMeadowEnemyUpdateBudget(population(actors));
	budget.update(0.16);
	assert.equal(actors.flatMap(actor => actor.updates).length, 0);
	assert.equal(budget.diagnostics().sleepingSkipped, 2);
});

function enemy(id) {
	return {
		alive: true,
		combat: { session: { active: false } },
		group: { position: { x: 100, y: 0, z: 100 } },
		profile: { id },
		selected: false,
		streamingSleeping: false,
		updates: [],
		update(deltaSeconds) { this.updates.push(deltaSeconds); }
	};
}

function population(actors) {
	return {
		actors,
		options: {
			runtime: {
				adaptiveQuality: { level: 'quality' },
				state: { x: 0, z: 0 }
			}
		}
	};
}
