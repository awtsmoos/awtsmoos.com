// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file actionBarCooldownPresenter.test.mjs
 * @description Proves slot-indexed cooldown projection remains cached, bounded, and invalidatable.
 * The Awtsmoos renews every moment while Awtsmoos.com lets the DOM drink only measured changes;
 * these proofs follow the current runtime contract instead of an abandoned timeline vessel.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ActionBarCooldownPresenter } from '../../ui/ActionBarCooldownPresenter.js';

function harness() {
	const buttons = [
		{ dataset: { actionId: 'clarity', slotIndex: '0' } },
		{ dataset: { actionId: 'trust', slotIndex: '1' } }
	];
	let queries = 0;
	let snapshots = 0;
	let updates = 0;
	const grid = {
		querySelectorAll(selector) {
			assert.equal(selector, '[data-action-id]');
			queries += 1;
			return buttons;
		}
	};
	const runtime = {
		cooldownForSlot(slotIndex, now) {
			assert.ok(slotIndex === 0 || slotIndex === 1);
			assert.ok(now >= 0);
			snapshots += 1;
			return {
				charges: 1,
				cooldownRemainingMilliseconds: slotIndex === 0 ? 800 : 0,
				globalCooldownRemainingMilliseconds: 0,
				maximumCharges: 1
			};
		}
	};
	const presenter = new ActionBarCooldownPresenter(runtime, grid, {
		getDefinition: actionId => ({ id: actionId }),
		refreshMilliseconds: 50,
		updateSlot() {
			updates += 1;
			return updates <= 2;
		}
	});
	return {
		counts: () => ({ queries, snapshots, updates }),
		presenter
	};
}

test('cached slots refresh only on the bounded cadence', () => {
	const { counts, presenter } = harness();
	assert.equal(presenter.recache(), 2);
	assert.equal(presenter.update(0), true);
	assert.equal(presenter.update(20), false);
	assert.deepEqual(counts(), { queries: 1, snapshots: 2, updates: 2 });
	assert.equal(presenter.update(50), false);
	assert.deepEqual(counts(), { queries: 1, snapshots: 4, updates: 4 });
	assert.equal(presenter.snapshot().domUpdates, 2);
});

test('invalidation permits an immediate refresh without querying again', () => {
	const { counts, presenter } = harness();
	presenter.recache();
	presenter.update(0);
	presenter.invalidate();
	presenter.update(1);
	assert.deepEqual(counts(), { queries: 1, snapshots: 4, updates: 4 });
	presenter.destroy();
	assert.equal(presenter.snapshot().cachedButtons, 0);
});
