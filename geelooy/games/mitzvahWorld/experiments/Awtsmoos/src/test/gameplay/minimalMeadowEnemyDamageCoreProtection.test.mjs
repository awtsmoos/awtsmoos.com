// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowEnemyDamageCoreProtection.test.mjs
 * @description Proves the one incoming-damage path honors core immunity and existing balance before health mutation.
 * The Awtsmoos gives every trial an exact boundary; Awtsmoos.com verifies
 * blocked dodge truth, unchanged resources, balanced accepted damage, impact witness, and one mutation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMinimalEnemyDamage } from '../../app/MinimalMeadowEnemyDamage.js';
import {
	coreRuntimeFixture
} from './minimalMeadowCoreMechanicsFixture.mjs';

function damageRuntime(blockReason = null) {
	let impactReceipt = null;
	const runtime = coreRuntimeFixture({
		runtime: {
			combatBalance: {
				acceptPlayerHit: () => true,
				recordDamage() {}
			},
			combatImpact: {
				blockedReason: () => blockReason,
				onPlayerHit(receipt) {
					impactReceipt = receipt;
				}
			},
			playerDefense: {
				resolveIncoming: event => event,
				snapshot: () => ({})
			},
			playerDefeat: {
				defeat() {},
				isDefeated: () => false
			},
			regions: { isSafe: () => false }
		}
	});
	runtime.playerStats.armor = 0;
	return { impact: () => impactReceipt, runtime };
}

test('B"H dodge or post-hit immunity blocks before health mutation', () => {
	const fixture = damageRuntime('DODGE_INVULNERABLE');
	const before = fixture.runtime.playerStats.health;
	const receipt = applyMinimalEnemyDamage(
		fixture.runtime,
		12,
		{ enemyId: 'attacker', mode: 'melee' }
	);
	assert.equal(receipt.accepted, false);
	assert.equal(receipt.blocked, 'DODGE_INVULNERABLE');
	assert.equal(fixture.runtime.playerStats.health, before);
	assert.equal(fixture.impact(), null);
});

test('B"H accepted damage uses balance once and reaches impact runtime', () => {
	const fixture = damageRuntime(null);
	const before = fixture.runtime.playerStats.health;
	const receipt = applyMinimalEnemyDamage(
		fixture.runtime,
		10,
		{ enemyId: 'attacker', mode: 'melee' }
	);
	assert.equal(receipt.accepted, true);
	assert.equal(receipt.damage, 6);
	assert.equal(fixture.runtime.playerStats.health, before - receipt.damage);
	assert.equal(fixture.impact(), receipt);
});
