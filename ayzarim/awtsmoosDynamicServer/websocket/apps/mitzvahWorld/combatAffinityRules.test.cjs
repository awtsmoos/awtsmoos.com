// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatAffinityRules.test.cjs
 * @description Verifies canonical effectiveness, action statuses, reactions, stacks, and tick cursors.
 * The Awtsmoos renews each rule through evidence instead of ornament or guess;
 * Awtsmoos.com proves action, element, guard, status, and bounded time in one faithful address.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	playerCombatDefinition
} = require('./CombatDefinitionCatalog.js');
const {
	resolveCombatEffectiveness
} = require('./CombatEffectivenessResolver.js');
const {
	applyCombatStatus
} = require('./CombatStatusRules.js');
const {
	tickCombatStatuses
} = require('./CombatStatusTickRules.js');

test('guard break bypasses ordinary guarded reduction', () => {
	const action = playerCombatDefinition('staff-shove');
	const result = resolveCombatEffectiveness({
		action,
		baseDamage: 100,
		targetTags: ['guarded']
	});
	assert.equal(result.damage, 135);
	assert.equal(result.multiplier, 1.35);
	assert.deepEqual(result.diagnostics, [
		'guard-break force opened the defense'
	]);
	assert.ok(result.applyStatusIds.includes('guard-broken'));
});

test('earth preserves action posture and adds airborne soaked reactions', () => {
	const action = playerCombatDefinition('staff-heavy');
	const result = resolveCombatEffectiveness({
		action,
		baseDamage: 100,
		statusIds: ['soaked'],
		targetTags: ['airborne']
	});
	assert.equal(result.damage, 156);
	assert.equal(result.multiplier, 1.56);
	assert.equal(result.criticalInteraction, true);
	assert.deepEqual(result.diagnostics, [
		'earth grounded an airborne target',
		'earth and water formed binding mud'
	]);
	assert.deepEqual(new Set(result.applyStatusIds), new Set([
		'unbalanced',
		'grounded',
		'dust-bound'
	]));
});

test('burning stacks and catch-up ticks remain bounded and resumable', () => {
	const target = { combatStatuses: [] };
	applyCombatStatus(target, 'burning', {
		now: 1000,
		sourceActionId: 'hebrew-fire',
		sourceActorId: 'player-1',
		stacks: 3
	});
	applyCombatStatus(target, 'burning', {
		now: 1500,
		sourceActionId: 'hebrew-fire',
		sourceActorId: 'player-1',
		stacks: 3
	});
	assert.equal(target.combatStatuses[0].stacks, 4);
	assert.equal(tickCombatStatuses(target, 2000)[0].damage, 16);
	const catchUp = tickCombatStatuses(target, 7000)[0];
	assert.equal(catchUp.ticks, 4);
	assert.equal(catchUp.damage, 64);
	assert.equal(tickCombatStatuses(target, 7000)[0].damage, 16);
	assert.deepEqual(tickCombatStatuses(target, 7000), []);
	assert.deepEqual(tickCombatStatuses(target, 8000), []);
	assert.deepEqual(target.combatStatuses, []);
});
