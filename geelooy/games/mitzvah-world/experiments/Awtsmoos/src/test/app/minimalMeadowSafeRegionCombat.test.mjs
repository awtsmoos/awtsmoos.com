// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowSafeRegionCombat.test.mjs
 * @description Proves Village Heart rejects hostile damage and releases active encounter ownership.
 * The Awtsmoos gives every trial an exact boundary; Awtsmoos.com blocks melee and projectiles at
 * the shared damage gate while pursuit, attack slots, and visible return receipts close together.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MinimalMeadowEnemyCombat } from '../../app/MinimalMeadowEnemyCombat.js';
import { applyMinimalEnemyDamage } from '../../app/MinimalMeadowEnemyDamage.js';
import { AwtsmoosEventBus } from '../../ui/AwtsmoosEventBus.js';

test('B"H safe region blocks damage before attack-slot acceptance', () => {
	const bus = new AwtsmoosEventBus();
	const blocked = [];
	let acceptedCalls = 0;
	bus.on('player:damage-blocked', event => blocked.push(event));
	const runtime = {
		bus,
		combatBalance: {
			acceptPlayerHit() {
				acceptedCalls += 1;
				return true;
			}
		},
		playerStats: { armor: 0, health: 100, maxHealth: 100 },
		regions: { isSafe: () => true }
	};
	const receipt = applyMinimalEnemyDamage(runtime, 25, {
		enemyId: 'shadow-one',
		mode: 'projectile'
	});
	assert.equal(receipt.accepted, false);
	assert.equal(receipt.blocked, 'safe-region');
	assert.equal(runtime.playerStats.health, 100);
	assert.equal(acceptedCalls, 0);
	assert.equal(blocked.length, 1);
});

test('B"H active encounter releases its slot at the safe boundary', () => {
	const bus = new AwtsmoosEventBus();
	const returns = [];
	const released = [];
	bus.on('enemy:return', event => returns.push(event));
	const actor = actorFixture();
	const runtime = {
		bus,
		combatBalance: {
			diagnostics: () => ({}),
			releaseActor(id) {
				released.push(id);
			}
		},
		playerDefeat: { isDefeated: () => false },
		playerStats: { health: 100 },
		regions: { isSafe: () => true }
	};
	const combat = new MinimalMeadowEnemyCombat(actor, runtime);
	combat.session.active = true;
	combat.session.state = 'pursuit';
	assert.equal(combat.update(0.016), false);
	assert.equal(combat.session.active, false);
	assert.equal(combat.session.lastTransition.reason, 'player-entered-safe-region');
	assert.deepEqual(released, ['shadow-one']);
	assert.equal(returns[0].reason, 'player-entered-safe-region');
	assert.equal(actor.action, 'idle');
});

function actorFixture() {
	return {
		action: 'run',
		alive: true,
		group: { position: { x: 30, z: 0 } },
		moving: true,
		payload() {
			return { id: 'shadow-one', name: 'First Shadow' };
		},
		profile: { id: 'shadow-one', x: 30, z: 0 }
	};
}
