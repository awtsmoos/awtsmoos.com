// B"H
// Boruch Hashem
// Blessed is He

/** @file torahAbilityStatusGateway.test.mjs @description Verifies exact accepted status targets. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { torahAbilityDefinition } from '../../gameplay/combat/TorahAbilityCatalog.js';
import { TorahAbilityStatusGateway } from '../../gameplay/combat/TorahAbilityStatusGateway.js';
import { TorahStatusEffectStore } from '../../gameplay/combat/TorahStatusEffectStore.js';

test('accepted world target IDs receive status without a population scan', () => {
	const statuses = new TorahStatusEffectStore({ clock: () => 0 });
	const gateway = new TorahAbilityStatusGateway({ playerId: 'shliach', statuses });
	const targets = gateway.apply(
		torahAbilityDefinition('light-against-concealment'),
		{ target: { id: 'stale-target' } },
		{ targetIds: ['accepted-shade'] }
	);
	assert.deepEqual(targets, ['accepted-shade']);
	assert.equal(statuses.snapshot('accepted-shade').effects[0].sourceId, 'shliach');
	assert.equal(statuses.snapshot('stale-target').effects.length, 0);
});

test('self healing and periodic damage emit bounded gameplay hooks', () => {
	const events = [];
	const bus = { emit: (type, detail) => events.push({ detail, type }) };
	const statuses = new TorahStatusEffectStore({ bus, clock: () => 0 });
	const gateway = new TorahAbilityStatusGateway({ bus, playerId: 'shliach', statuses });
	gateway.apply(torahAbilityDefinition('grateful-awakening'), {}, { ok: true });
	assert.equal(statuses.snapshot('shliach').effects[0].effectId, 'returning-spark');
	assert.equal(events.some(event => event.type === 'combat:healing'), true);
	gateway.periodicTick({
		bossScale: 0.5,
		effectId: 'flame-of-enthusiasm',
		modifiers: { damagePerTick: 4 },
		sourceId: 'shliach',
		stacks: 2,
		strength: 1,
		targetId: 'shade'
	});
	const tick = events.find(event => event.type === 'combat:status-tick');
	assert.equal(tick.detail.damage, 4);
	assert.equal(tick.detail.targetId, 'shade');
});
