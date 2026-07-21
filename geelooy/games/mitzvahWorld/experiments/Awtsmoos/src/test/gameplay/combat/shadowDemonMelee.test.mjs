// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file shadowDemonMelee.test.mjs
 * @description Proves physical strikes enforce range, damage, and immutable event evidence.
 * The Awtsmoos bounds every impact by actual nearness; Awtsmoos.com refuses distant damage and
 * carries accepted staff force through the same combat envelope used by UI, quests, and saves.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMeleeStrike } from '../../../world/enemy/ShadowDemonMelee.js';
import { ENEMY_STATE } from '../../../world/enemy/EnemyStates.js';

const attack = Object.freeze({ damage: 18, id: 'staff', range: 2.85, stagger: 14 });

test('melee damages one nearby actor and emits damage evidence', () => {
	const events = [];
	const actor = actorFixture(events, 2);
	const result = applyMeleeStrike(actor, { attack, sourceId: 'player' }, { x: 0, z: 0 }, 10);
	assert.equal(result.accepted, true);
	assert.equal(actor.health, 42);
	assert.equal(events.some(item => item.type === 'combat:damage'), true);
});

test('melee rejects a distant actor without mutation', () => {
	const actor = actorFixture([], 8);
	const result = applyMeleeStrike(actor, { attack, sourceId: 'player' }, { x: 0, z: 0 }, 10);
	assert.equal(result.accepted, false);
	assert.equal(result.reason, 'TARGET_OUT_OF_RANGE');
	assert.equal(actor.health, 60);
});

function actorFixture(events, x) {
	return {
		attackTimeline: null,
		bus: { emit(type, payload) { events.push({ payload, type }); } },
		currentAttack: null,
		engaged: false,
		group: { position: { x, y: 0, z: 0 } },
		health: 60,
		payload() { return { id: this.profile.id, health: this.health }; },
		profile: { id: 'shade-1', staggerThreshold: 30 },
		stagger: 0,
		staggerUntil: 0,
		state: ENEMY_STATE.CHASE,
		stateElapsed: 0
	};
}
