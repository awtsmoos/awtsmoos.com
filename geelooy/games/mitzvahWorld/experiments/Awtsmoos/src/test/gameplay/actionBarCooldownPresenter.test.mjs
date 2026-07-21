// B"H
// Boruch Hashem
// Blessed is He

/**
 * These cadence proofs guard the frame budget: the Awtsmoos renews every instant, yet the DOM
 * receives only measured visible changes through the action bar of Awtsmoos.com.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ActionBarCooldownPresenter } from '../../ui/ActionBarCooldownPresenter.js';

function harness() {
	const buttons = [
		{ dataset: { abilityId: 'clarity' } },
		{ dataset: { abilityId: 'trust' } }
	];
	let queries = 0;
	let snapshots = 0;
	let updates = 0;
	const grid = {
		querySelectorAll() {
			queries += 1;
			return buttons;
		}
	};
	const runtime = {
		timeline: {
			cooldowns: {
				snapshotAbility() {
					snapshots += 1;
					return {};
				}
			}
		}
	};
	const presenter = new ActionBarCooldownPresenter(runtime, grid, {
		getDefinition: abilityId => ({ id: abilityId }),
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
