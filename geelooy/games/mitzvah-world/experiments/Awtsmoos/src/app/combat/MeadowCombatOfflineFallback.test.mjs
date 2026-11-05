// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowCombatOfflineFallback.test.mjs
 * @description Proves graceful offline behavior for stream 4: with no socket and
 * no enemy authority installed (solo, connection failure, local-tab), projectile
 * and melee impacts resolve through the exact local combat path — no throw, no
 * network touch, local damage stands.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	resolveMinimalMeadowCombatImpact
} from '../MinimalMeadowCombatImpactAuthority.js';
import {
	attemptMeleeImpact
} from './MeleeImpactRuntime.js';

function createBus() {
	const events = [];
	return {
		events,
		emit(type, payload) {
			events.push({ payload, type });
		},
		on() {
			return () => {};
		},
		types() {
			return events.map(event => event.type);
		}
	};
}

function createActor() {
	return {
		action: 'idle',
		airborne: false,
		hidden: false,
		defense: { value: 4 },
		group: { position: { x: 0, y: 0, z: 2 } },
		profile: { id: 'tzel-chai', tags: [], xpReward: 55 },
		statusLedger: null,
		applyDamage(amount) {
			return { damage: amount, defeated: false, health: 70 };
		}
	};
}

function createCombat() {
	const bus = createBus();
	return {
		bus,
		rewarded: [],
		reward(amount) {
			this.rewarded.push(amount);
		},
		runtime: {
			// No enemyAuthority: solo / offline / local-tab. Every server call
			// in the impact path is guarded by this absence.
			bus,
			derivedStats: null,
			state: { facing: 0, renderY: 0, x: 0, z: 0 }
		}
	};
}

test('projectile impact without a connection resolves locally (pending:false)', () => {
	const combat = createCombat();
	const target = createActor();
	const resolution = resolveMinimalMeadowCombatImpact(
		combat,
		{
			action: { damage: 30, label: 'Hebrew Fire', letters: 'א' },
			actionId: 'hebrew-fire',
			target
		},
		{ x: 0, y: 1, z: 2 }
	);
	assert.equal(resolution.pending, false);
	assert.equal(resolution.result.damage, 30);
	assert.ok(combat.bus.types().includes('combat:impact'));
	assert.ok(
		!combat.bus.types().includes('combat:rejected'),
		'no server round-trip may be attempted offline'
	);
});

test('melee impact without a connection resolves locally', () => {
	const combat = createCombat();
	const target = createActor();
	const applied = attemptMeleeImpact(combat, {
		action: {
			arcDegrees: 72,
			damage: 24,
			range: 3.8,
			verticalTolerance: 2.1
		},
		actionId: 'staff.light-one',
		elapsed: 0.2,
		hitIds: new Set(),
		target
	});
	assert.equal(applied, true);
	assert.ok(combat.bus.types().includes('combat:impact'));
	assert.ok(combat.bus.types().includes('combat:melee-result'));
});

test('an installed authority that declines control still falls back to local', () => {
	const combat = createCombat();
	combat.runtime.enemyAuthority = {
		controls: () => false
	};
	const resolution = resolveMinimalMeadowCombatImpact(
		combat,
		{
			action: { damage: 30, label: 'Hebrew Fire', letters: 'א' },
			actionId: 'hebrew-fire',
			target: createActor()
		},
		{ x: 0, y: 1, z: 2 }
	);
	assert.equal(resolution.pending, false);
	assert.equal(resolution.result.damage, 30);
});
