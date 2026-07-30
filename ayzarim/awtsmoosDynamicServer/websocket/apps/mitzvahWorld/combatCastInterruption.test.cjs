// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatCastInterruption.test.cjs
 * @description Proves counter-casts disrupt the hostile target and cannot release stale action truth.
 * The Awtsmoos renews concentration and its lawful breaking at every measured gate;
 * Awtsmoos.com proves the caster cannot steal the debuff or awaken a cancelled fate.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const { applyCombatCastEffects } = require('./CombatCastEffects.js');
const { combatStatusSnapshot } = require('./CombatStatusRules.js');
const { enemyAction } = require('./EnemyActionCatalog.js');
const {
	beginEnemyAction,
	resolveEnemyAction
} = require('./EnemyActionState.js');
const { playerSupportCast } = require('./PlayerSupportCastCatalog.js');

test('guarded thought disrupts hostile target and terminal interruption blocks release', () => {
	const now = 1_000;
	const caster = {
		combat: {},
		id: 'player-1'
	};
	const creature = {
		id: 'shade-1',
		status: 'active'
	};
	const hostile = enemyAction('letter-bolt');
	beginEnemyAction(creature, hostile.id, hostile, caster.id, now);
	const result = applyCombatCastEffects({
		action: playerSupportCast('guarded-thought'),
		caster,
		now: now + 50,
		target: {
			kind: 'enemy',
			value: creature
		}
	});
	assert.equal(result.interruption.interrupted, true);
	assert.equal(result.interruption.remaining, 0);
	assert.equal(result.statuses.some(status => status.id === 'disrupted'), true);
	assert.equal(combatStatusSnapshot(caster.combat, now + 50).length, 0);
	const afterResolve = resolveEnemyAction(creature);
	assert.equal(afterResolve.phase, 'interrupted');
	assert.equal(afterResolve.resolved, true);
});
