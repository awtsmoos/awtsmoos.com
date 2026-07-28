// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowAdaptiveQuality.test.mjs
 * @description Proves hysteretic quality transitions and distributed distant-enemy frame labor.
 * The Awtsmoos measures finite strain without panic; Awtsmoos.com preserves immediate battle
 * cadence while distant idle actors receive accumulated time on stable distributed frames.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowAdaptiveQuality } from '../../app/MinimalMeadowAdaptiveQuality.js';
import {
	enemyUpdateStride,
	MinimalMeadowEnemyUpdateBudget
} from '../../app/MinimalMeadowEnemyUpdateBudget.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

test('B"H sustained pressure degrades and sustained headroom restores quality', () => {
	const bus = new AwtsmoosEventBus();
	const events = [];
	bus.on('performance:quality-changed', event => events.push(event));
	const quality = new MinimalMeadowAdaptiveQuality(
		{ bus },
		{
			degradeAfter: 2,
			fastMilliseconds: 10,
			recoverAfter: 2,
			slowMilliseconds: 20,
			smoothing: 1
		}
	);
	quality.update(0.03);
	quality.update(0.03);
	assert.equal(quality.level, 'balanced');
	quality.update(0.03);
	quality.update(0.03);
	assert.equal(quality.level, 'performance');
	quality.update(0.005);
	quality.update(0.005);
	assert.equal(quality.level, 'balanced');
	quality.update(0.005);
	quality.update(0.005);
	assert.equal(quality.level, 'quality');
	assert.equal(events.length, 4);
	assert.equal(quality.snapshot().averageFps, 200);
});

test('B"H engaged actors remain full-rate while far idle actors conserve elapsed time', () => {
	const runtime = {
		adaptiveQuality: { level: 'performance' },
		state: { x: 0, z: 0 }
	};
	const near = actorFixture('near', 8, true);
	const far = actorFixture('far', 120, false);
	const population = { actors: [near, far], options: { runtime } };
	const budget = new MinimalMeadowEnemyUpdateBudget(population);
	assert.equal(enemyUpdateStride(near, population), 1);
	assert.equal(enemyUpdateStride(far, population), 6);
	for (let frame = 0; frame < 6; frame += 1) budget.update(0.1);
	assert.equal(near.updates.length, 6);
	assert.equal(far.updates.length, 1);
	const delivered = far.updates.reduce((sum, value) => sum + value, 0);
	const pending = budget.accumulated.get('far') || 0;
	assert.ok(Math.abs(delivered + pending - 0.6) < 0.00001);
	assert.equal(budget.diagnostics().skipped, 5);
});

function actorFixture(id, distance, engaged) {
	const updates = [];
	return {
		alive: true,
		combat: { session: { active: engaged } },
		group: { position: { x: distance, z: 0 } },
		profile: { id },
		selected: false,
		update(deltaSeconds) {
			updates.push(deltaSeconds);
		},
		updates
	};
}
