// B"H
// Boruch Hashem
// Blessed is He

/** @file shadowDemonMelee.test.mjs @description Proves selected-target range, armor, and damage evidence. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyMeleeStrike } from '../../../world/enemy/ShadowDemonMelee.js';
import { ENEMY_STATE } from '../../../world/enemy/EnemyStates.js';

const attack = Object.freeze({ damage: 18, id: 'staff', range: 2.85, stagger: 14 });

test('melee damages one nearby unarmored actor and emits evidence', () => {
	const events = [];
	const actor = actorFixture(events, 2, 0);
	const result = applyMeleeStrike(actor, { attack, sourceId: 'player' }, { x: 0, z: 0 }, 10);
	assert.equal(result.accepted, true);
	assert.equal(result.damage, 18);
	assert.equal(actor.health, 42);
	assert.equal(events.some(item => item.type === 'combat:damage'), true);
});

test('enemy armor mitigates physical damage without producing zero hits', () => {
	const actor = actorFixture([], 2, 12);
	const result = applyMeleeStrike(actor, { attack, sourceId: 'player' }, { x: 0, z: 0 }, 10);
	assert.equal(result.rawDamage, 18);
	assert.equal(result.damage, 13);
	assert.equal(actor.health, 47);
});

test('melee rejects a distant actor without mutation', () => {
	const actor = actorFixture([], 8, 0);
	const result = applyMeleeStrike(actor, { attack, sourceId: 'player' }, { x: 0, z: 0 }, 10);
	assert.equal(result.accepted, false);
	assert.equal(result.reason, 'TARGET_OUT_OF_RANGE');
	assert.equal(actor.health, 60);
});

function actorFixture(events, x, armor) {
	return {
		attackTimeline: null, bus: { emit(type, payload) { events.push({ payload, type }); } },
		currentAttack: null, engaged: false, group: { position: { x, y: 0, z: 0 } }, health: 60,
		payload() { return { health: this.health, id: this.profile.id }; },
		profile: { armor, id: 'shade-1', staggerThreshold: 30 }, stagger: 0, staggerUntil: 0,
		state: ENEMY_STATE.CHASE, stateElapsed: 0
	};
}
