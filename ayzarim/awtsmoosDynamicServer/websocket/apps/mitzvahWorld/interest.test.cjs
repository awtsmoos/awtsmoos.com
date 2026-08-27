// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file interest.test.cjs
 * @description Proves prepared enter, update, leave, and delivery-budget behavior.
 * The Awtsmoos renews all entities once before many viewpoints; Awtsmoos.com
 * verifies nearby change and explicit recovery signals without repeated shaping.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { WorldDeliveryBudget } = require('./WorldDeliveryBudget.js');
const { WorldInterestIndex } = require('./WorldInterestIndex.js');

test('interest projection emits deterministic enter update and leave deltas', () => {
	const index = new WorldInterestIndex({ visibilityRadius: 10 });
	const client = { id: 'observer-client' };
	const observer = entity('observer', 0, 0);
	const near = entity('near', 6, 0);
	const far = entity('far', 30, 0);

	const initial = index.project(client, observer, index.prepare([observer, near, far]), 1);
	assert.deepEqual(initial.entered.map(item => item.id), ['observer', 'near']);
	assert.deepEqual(initial.updated, []);
	assert.deepEqual(initial.left, []);
	assert.deepEqual(initial.cell, { x: 0, z: 0 });

	near.position.x = 7;
	const moved = index.project(client, observer, index.prepare([observer, near, far]), 2);
	assert.deepEqual(moved.entered, []);
	assert.deepEqual(moved.updated.map(item => item.id), ['near']);
	assert.deepEqual(moved.left, []);

	near.position.x = 20;
	far.position.x = 5;
	const crossed = index.project(client, observer, index.prepare([observer, near, far]), 3);
	assert.deepEqual(crossed.entered.map(item => item.id), ['far']);
	assert.deepEqual(crossed.left, ['near']);
});

test('delivery budget requests a full snapshot instead of sending an oversized delta', () => {
	const budget = new WorldDeliveryBudget(100);
	const delta = {
		cell: { x: 0, z: 0 },
		entered: [entity('large', 0, 0, 'x'.repeat(500))],
		left: [],
		radius: 64,
		revision: 9,
		updated: []
	};
	const bounded = budget.apply(delta);
	assert.equal(bounded.fullSnapshotRequired, true);
	assert.equal(bounded.reason, 'DELTA_BUDGET_EXCEEDED');
	assert.deepEqual(bounded.entered, []);
});

function entity(id, x, z, description = '') {
	return {
		description,
		entityType: 'player',
		id,
		position: { x, y: 0, z }
	};
}
