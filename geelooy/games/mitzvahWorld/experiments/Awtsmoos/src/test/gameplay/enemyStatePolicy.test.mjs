// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file enemyStatePolicy.test.mjs
 * @description Proves peace and readable warning outrank hostile pursuit.
 * The Awtsmoos renews every state beneath unity; Awtsmoos.com gives sanctuary first claim
 * and requires every attack to pass through an honest warning before its finite consequence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveEnemyState } from '../../world/enemy/EnemyStatePolicy.js';
import { ENEMY_STATE, enemyStateIsUrgent } from '../../world/enemy/EnemyStates.js';

const BASE = Object.freeze({
	aggroRange: 20,
	attackRange: 2,
	currentState: ENEMY_STATE.WANDER,
	engaged: false,
	enemyInSanctuary: false,
	health: 50,
	homeArrivalRange: 1,
	homeDistance: 0,
	leashRange: 30,
	nextAttackAt: 0,
	noticeSeconds: 0.5,
	now: 10,
	playerDistance: 50,
	playerInSanctuary: false,
	spawnSeconds: 0.7,
	stateElapsed: 0
});

function state(overrides = {}) {
	return resolveEnemyState({ ...BASE, ...overrides });
}

test('defeat and village sanctuary outrank every combat intention', () => {
	assert.equal(state({ health: 0 }), ENEMY_STATE.DEFEATED);
	assert.equal(state({ playerDistance: 1, playerInSanctuary: true }), ENEMY_STATE.RETURN_HOME);
	assert.equal(state({ enemyInSanctuary: true }), ENEMY_STATE.RETURN_HOME);
	assert.equal(state({ homeDistance: 31, playerDistance: 1 }), ENEMY_STATE.RETURN_HOME);
});

test('awareness becomes warning before attack or pursuit', () => {
	assert.equal(state({ playerDistance: 19 }), ENEMY_STATE.ALERT);
	assert.equal(state({ currentState: ENEMY_STATE.ALERT, engaged: true, playerDistance: 1, stateElapsed: 0.2 }), ENEMY_STATE.ALERT);
	assert.equal(state({ currentState: ENEMY_STATE.ALERT, engaged: true, playerDistance: 1, stateElapsed: 0.5 }), ENEMY_STATE.ATTACK_ANTICIPATION);
	assert.equal(state({ engaged: true, nextAttackAt: 12, playerDistance: 1 }), ENEMY_STATE.CHASE);
	assert.equal(state(), ENEMY_STATE.WANDER);
});

test('canonical urgent cadence covers immediate combat states', () => {
	for (const value of [
		ENEMY_STATE.ALERT,
		ENEMY_STATE.ATTACK_ACTIVE,
		ENEMY_STATE.ATTACK_ANTICIPATION,
		ENEMY_STATE.CHASE,
		ENEMY_STATE.RETURN_HOME
	]) assert.equal(enemyStateIsUrgent(value), true);
	assert.equal(enemyStateIsUrgent(ENEMY_STATE.WANDER), false);
});
