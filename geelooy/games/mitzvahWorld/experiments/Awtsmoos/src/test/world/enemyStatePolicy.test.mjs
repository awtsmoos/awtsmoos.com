// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file enemyStatePolicy.test.mjs
 * @description Proves canonical spawn, alert, timeline, return, stagger, and defeat phases.
 * The Awtsmoos grants every concealment a beginning and an end; Awtsmoos.com records
 * warning, impact, recovery, pursuit, return, and defeat as finite witnessed states.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { enemyStateIsUrgent, resolveEnemyState } from '../../world/enemy/EnemyStatePolicy.js';
import { ENEMY_STATE } from '../../world/enemy/EnemyStates.js';

const BASE = Object.freeze({
	aggroRange: 20,
	attackRange: 2.5,
	currentState: ENEMY_STATE.WANDER,
	engaged: false,
	health: 50,
	homeArrivalRange: 1,
	homeDistance: 0,
	leashRange: 30,
	nextAttackAt: 0,
	noticeSeconds: 0.5,
	now: 10,
	playerDistance: 12,
	spawnSeconds: 0.7,
	staggerUntil: 0,
	stateElapsed: 0
});

function state(overrides = {}) {
	return resolveEnemyState({ ...BASE, ...overrides });
}

test('health, sanctuary, and territory override combat intent', () => {
	assert.equal(state({ health: 0 }), ENEMY_STATE.DEFEATED);
	assert.equal(state({ homeDistance: 31 }), ENEMY_STATE.RETURN_HOME);
	assert.equal(state({ playerInSanctuary: true }), ENEMY_STATE.RETURN_HOME);
	assert.equal(state({ currentState: ENEMY_STATE.RETURN_HOME, homeDistance: 2 }), ENEMY_STATE.RETURN_HOME);
});

test('spawn and warning finish before the canonical attack timeline begins', () => {
	assert.equal(state({ currentState: ENEMY_STATE.SPAWN, stateElapsed: 0.6 }), ENEMY_STATE.SPAWN);
	assert.equal(state({ playerDistance: 2 }), ENEMY_STATE.ALERT);
	assert.equal(state({ currentState: ENEMY_STATE.ALERT, engaged: true, playerDistance: 2, stateElapsed: 0.5 }), ENEMY_STATE.ATTACK_ANTICIPATION);
	assert.equal(state({ attackState: ENEMY_STATE.ATTACK_ACTIVE, engaged: true, playerDistance: 2 }), ENEMY_STATE.ATTACK_ACTIVE);
	assert.equal(state({ attackState: ENEMY_STATE.ATTACK_RECOVERY, engaged: true, playerDistance: 2 }), ENEMY_STATE.ATTACK_RECOVERY);
});

test('stagger and cooldown resolve into bounded pursuit', () => {
	assert.equal(state({ engaged: true, now: 10, staggerUntil: 10.2 }), ENEMY_STATE.STAGGER);
	assert.equal(state({ engaged: true, nextAttackAt: 12, playerDistance: 2 }), ENEMY_STATE.CHASE);
});

test('urgent states include every immediate semantic combat phase', () => {
	for (const value of [
		ENEMY_STATE.CHASE,
		ENEMY_STATE.RETURN_HOME,
		ENEMY_STATE.ATTACK_ANTICIPATION,
		ENEMY_STATE.ATTACK_ACTIVE,
		ENEMY_STATE.ATTACK_RECOVERY
	]) assert.equal(enemyStateIsUrgent(value), true);
	assert.equal(enemyStateIsUrgent(ENEMY_STATE.WANDER), false);
});
