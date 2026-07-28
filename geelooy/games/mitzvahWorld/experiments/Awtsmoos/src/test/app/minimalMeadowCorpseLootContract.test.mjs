// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowCorpseLootContract.test.mjs
 * @description Proves corpse loot opens first, transfers chosen stacks, and hides only when empty.
 * The Awtsmoos gives every recovered object a deliberate crossing; Awtsmoos.com prevents
 * a second corpse tap from silently stealing all and preserves the body while treasure remains.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowCorpseLootState } from '../../app/MinimalMeadowCorpseLootState.js';
import {
	lootAllMinimalEnemyCorpse,
	openMinimalEnemyCorpseLoot,
	takeMinimalEnemyCorpseItem
} from '../../app/MinimalMeadowEnemyLoot.js';

test('B"H corpse state exposes and removes only the chosen stack', () => {
	const state = new MinimalMeadowCorpseLootState([
		{ itemId: 'perutas', quantity: 13 },
		{ itemId: 'prepared-hide', quantity: 1 }
	]);
	assert.deepEqual(state.snapshot(), [
		{ itemId: 'perutas', quantity: 13 },
		{ itemId: 'prepared-hide', quantity: 1 }
	]);
	assert.deepEqual(state.take('prepared-hide'), {
		itemId: 'prepared-hide',
		quantity: 1
	});
	assert.equal(state.empty, false);
	assert.deepEqual(state.snapshot(), [{ itemId: 'perutas', quantity: 13 }]);
});

test('B"H opening corpse loot transfers nothing and publishes the actor', () => {
	const fixture = corpseFixture();
	const receipt = openMinimalEnemyCorpseLoot(fixture.actor);
	assert.equal(receipt.phase, 'opened');
	assert.deepEqual(fixture.added, []);
	assert.equal(fixture.events.at(-1).name, 'enemy:loot-open');
	assert.equal(fixture.events.at(-1).payload.actor, fixture.actor);
	assert.equal(fixture.actor.group.visible, true);
});

test('B"H Take leaves corpse visible while Loot All completes remaining treasure', () => {
	const fixture = corpseFixture();
	const first = takeMinimalEnemyCorpseItem(fixture.actor, 'prepared-hide');
	assert.equal(first.empty, false);
	assert.equal(fixture.actor.looted, false);
	assert.equal(fixture.actor.group.visible, true);
	assert.deepEqual(fixture.added, [[{ itemId: 'prepared-hide', quantity: 1 }]]);
	const final = lootAllMinimalEnemyCorpse(fixture.actor);
	assert.equal(final.empty, true);
	assert.equal(fixture.actor.looted, true);
	assert.equal(fixture.actor.group.visible, false);
	assert.deepEqual(fixture.added[1], [{ itemId: 'perutas', quantity: 13 }]);
	assert.ok(fixture.events.some((event) => event.name === 'enemy:looted'));
});

function corpseFixture() {
	const added = [];
	const events = [];
	const actor = {
		alive: false,
		bus: {
			emit(name, payload) {
				events.push({ name, payload });
			}
		},
		group: { userData: {}, visible: true },
		looted: false,
		lootState: new MinimalMeadowCorpseLootState([
			{ itemId: 'perutas', quantity: 13 },
			{ itemId: 'prepared-hide', quantity: 1 }
		]),
		payload: () => ({ id: 'ketem-layla' }),
		profile: { id: 'ketem-layla', name: 'Ketem Layla' },
		runtime: {
			inventory: {
				addMany(items) {
					added.push(items);
				}
			}
		},
		selected: true
	};
	return { actor, added, events };
}
