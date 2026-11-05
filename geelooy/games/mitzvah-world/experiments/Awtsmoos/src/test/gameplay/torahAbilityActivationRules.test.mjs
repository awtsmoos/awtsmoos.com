// B"H
// Boruch Hashem
// Blessed is He

/** @file torahAbilityActivationRules.test.mjs @description Verifies shared ability preflight reasons. */

import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateTorahAbilityActivation } from '../../gameplay/combat/TorahAbilityActivationRules.js';
import { torahAbilityDefinition } from '../../gameplay/combat/TorahAbilityCatalog.js';

test('selected hostile ability validates target, range, facing, and resource', () => {
	const ability = torahAbilityDefinition('light-against-concealment');
	assert.equal(evaluateTorahAbilityActivation(ability, { resource: 100 }).reason, 'no-target');
	assert.equal(evaluateTorahAbilityActivation(ability, {
		distance: 19,
		resource: 100,
		target: { attackable: true, id: 'shade' }
	}).reason, 'out-of-range');
	assert.equal(evaluateTorahAbilityActivation(ability, {
		facing: false,
		resource: 100,
		target: { attackable: true, id: 'shade' }
	}).reason, 'not-facing');
	assert.equal(evaluateTorahAbilityActivation(ability, {
		resource: 0,
		target: { attackable: true, id: 'shade' }
	}).reason, 'insufficient-resource');
});

test('self abilities need no target while ally and reactive abilities do', () => {
	assert.equal(evaluateTorahAbilityActivation(
		torahAbilityDefinition('shield-of-trust'),
		{ resource: 100 }
	).ok, true);
	assert.equal(evaluateTorahAbilityActivation(
		torahAbilityDefinition('waters-of-purification'),
		{ resource: 100 }
	).reason, 'no-target');
	assert.equal(evaluateTorahAbilityActivation(
		torahAbilityDefinition('guarded-thought'),
		{ resource: 100, target: { attackable: true } }
	).reason, 'no-reactive-window');
});

test('cooldown and unlock decisions preserve their exact UI reason', () => {
	const ability = torahAbilityDefinition('grateful-awakening');
	assert.equal(evaluateTorahAbilityActivation(ability, { unlocked: false }).reason, 'not-unlocked');
	assert.equal(evaluateTorahAbilityActivation(ability, {
		cooldown: { ok: false, reason: 'global-cooldown', state: {} },
		resource: 100
	}).reason, 'global-cooldown');
});
