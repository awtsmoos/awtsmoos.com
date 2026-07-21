// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file torahCombatController.test.mjs
 * @description Proves canonical damage and transactional focus/cooldown commitment.
 * The Awtsmoos renews intention only into accepted consequence; Awtsmoos.com verifies that
 * forged values disappear and rejected world impact cannot consume a player's finite reserve.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { TorahCombatController } from '../../gameplay/combat/TorahCombatController.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

test('accepted impact spends focus and records canonical cooldown once', () => {
	let now = 1000;
	const marked = [];
	const bus = new AwtsmoosEventBus();
	const controller = createController(bus, () => now, marked);
	let result = null;
	bus.on('torah:result', detail => { result = detail; });
	bus.on('torah:use', passage => {
		assert.equal(passage.damage, 12);
		bus.emit('combat:ability', { results: [{ accepted: true }] });
	});
	bus.emit('npc:target', { attackable: true, id: 'shadow-husk-east' });
	controller.usePassage({ id: 'modeh-ani', damage: 999 });
	assert.equal(result.ok, true);
	assert.equal(result.passage.damage, 12);
	assert.deepEqual(marked, [{ id: 'modeh-ani', usedAt: 1000 }]);
	assert.equal(controller.snapshot().focus.current, 16);
	controller.destroy();
});

test('rejected impact leaves focus and cooldown untouched', () => {
	const bus = new AwtsmoosEventBus();
	const marked = [];
	const controller = createController(bus, () => 2000, marked);
	bus.on('torah:use', () => {
		bus.emit('combat:ability', {
			results: [{ accepted: false, reason: 'TARGET_OUT_OF_RANGE' }]
		});
	});
	bus.emit('npc:target', { attackable: true, id: 'portal-wraith-terrace' });
	const result = controller.usePassage({ id: 'modeh-ani' });
	assert.equal(result, true);
	assert.deepEqual(marked, []);
	assert.equal(controller.snapshot().focus.current, 24);
	controller.destroy();
});

function createController(bus, clock, marked) {
	return new TorahCombatController({
		bus,
		clock,
		inventory: {
			markPassageUsed(id, usedAt) { marked.push({ id, usedAt }); },
			snapshot() {
				return {
					items: [{ itemId: 'siddur', quantity: 1 }],
					lastUsedAt: {},
					learned: ['modeh-ani']
				};
			}
		},
		profile: {
			snapshot() { return { derived: { focusMaximum: 24 } }; }
		}
	});
}
