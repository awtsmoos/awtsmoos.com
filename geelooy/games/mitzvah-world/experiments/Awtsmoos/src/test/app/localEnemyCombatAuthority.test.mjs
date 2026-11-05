// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file localEnemyCombatAuthority.test.mjs
 * @description Proves solo damage uses canonical affinity, resistance, statuses, and receipts.
 * The Awtsmoos renews the same law in solitude and among many without division;
 * Awtsmoos.com tests that local consequence follows shared identity rather than caller revision.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { CombatStatusLedger } from '../../gameplay/affinity/CombatStatusLedger.js';
import { resolveLocalEnemyCombatImpact } from '../../app/combat/LocalEnemyCombatAuthority.js';

test('local enemy authority applies canonical typed damage and bounded statuses', () => {
	let health = 100;
	const actor = {
		action: 'idle',
		alive: true,
		applyDamage(amount) {
			health = Math.max(0, health - amount);
			return {
				damage: amount,
				defeated: health === 0,
				health
			};
		},
		profile: {
			affinityProfileId: 'dybbuk-shade',
			id: 'local-proof-enemy',
			tags: ['shadow']
		},
		statusLedger: new CombatStatusLedger({ clock: () => 1_000 })
	};
	const result = resolveLocalEnemyCombatImpact({
		actionId: 'hebrew-fire',
		actor,
		localAction: { damage: 28 },
		runtime: {}
	});
	assert.equal(result.action.affinityId, 'binah');
	assert.equal(result.action.elementId, 'fire');
	assert.equal(result.effectiveness.baseDamage, 28);
	assert.equal(result.effectiveness.finalDamage, result.damage);
	assert.equal(result.effectiveness.multiplier < 1, true);
	assert.equal(result.statuses.applied.some(status => status.id === 'burning'), true);
	assert.equal(result.statuses.current.length <= 24, true);
	assert.equal(health, 100 - result.damage);
});

test('local enemy authority rejects unknown action identity', () => {
	assert.throws(() => resolveLocalEnemyCombatImpact({
		actionId: 'forged-action',
		actor: {
			applyDamage() {},
			profile: {},
			statusLedger: new CombatStatusLedger()
		},
		localAction: { damage: 999 },
		runtime: {}
	}), /UNKNOWN_COMBAT_ACTION/);
});
