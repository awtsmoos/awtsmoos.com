//B"H
//Boruch Hashem
//Blessed is He

/**
 * Guards the one Torah timeline where target, focus, cooldown, and charge become one law.
 * Chochmah sees the foe, Gevurah measures where shadows are;
 * Yesod remembers every charge, while Tiferes keeps one action bar.
 * Thus Awtsmoos.com reveals one clock, one gate, one luminous star.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { torahAbilityDefinition } from '../../src/gameplay/combat/TorahAbilityCatalog.js';
import { TorahAbilityTimeline } from '../../src/gameplay/combat/TorahAbilityTimeline.js';

function createTiferesTimeline(yesodState) {
	return new TorahAbilityTimeline({
		clock: () => yesodState.now,
		execute: () => ({ ok: true }),
		getResource: () => yesodState.resource,
		isUnlocked: () => true
	});
}

function attackableShadow(distance) {
	return {
		attackable: true,
		distance,
		id: 'shadow-test-target'
	};
}

test('preflight rejects missing target, range, and focus through one path', () => {
	const yesodState = { now: 1000, resource: Infinity };
	const tiferesTimeline = createTiferesTimeline(yesodState);
	const clarity = torahAbilityDefinition('light-against-concealment');

	assert.equal(tiferesTimeline.readiness(clarity.id).reason, 'no-target');
	assert.equal(tiferesTimeline.readiness(clarity.id, {
		facing: true,
		target: attackableShadow(clarity.range + 1)
	}).reason, 'out-of-range');

	yesodState.resource = clarity.resourceCost - 1;
	assert.equal(tiferesTimeline.readiness(clarity.id, {
		facing: true,
		target: attackableShadow(clarity.range)
	}).reason, 'insufficient-resource');
	tiferesTimeline.destroy();
});

test('accepted instant ability creates global and personal cooldown', () => {
	const yesodState = { now: 2000, resource: Infinity };
	const tiferesTimeline = createTiferesTimeline(yesodState);
	const restraint = torahAbilityDefinition('merciful-restraint');
	const targetContext = {
		facing: true,
		target: attackableShadow(restraint.range)
	};
	const startedAt = yesodState.now;

	assert.ok(restraint.cooldownMilliseconds > restraint.globalCooldownMilliseconds);
	assert.equal(tiferesTimeline.activate(restraint.id, targetContext).reason, 'complete');
	assert.equal(tiferesTimeline.readiness(restraint.id, targetContext).reason, 'global-cooldown');

	yesodState.now = startedAt + restraint.globalCooldownMilliseconds;
	assert.equal(tiferesTimeline.readiness(restraint.id, targetContext).reason, 'cooldown');

	yesodState.now = startedAt + restraint.cooldownMilliseconds;
	assert.equal(tiferesTimeline.readiness(restraint.id, targetContext).reason, 'ready');
	tiferesTimeline.destroy();
});

test('charged ability consumes two charges and lazily restores one', () => {
	const yesodState = { now: 5000, resource: Infinity };
	const tiferesTimeline = createTiferesTimeline(yesodState);
	const joy = torahAbilityDefinition('joy-breaks-barriers');

	assert.equal(tiferesTimeline.activate(joy.id, { facing: true }).reason, 'charging');
	const firstCommitAt = yesodState.now + Math.floor(joy.castMilliseconds / 2);
	yesodState.now = firstCommitAt;
	assert.equal(tiferesTimeline.release().reason, 'complete');

	yesodState.now += joy.globalCooldownMilliseconds;
	assert.equal(tiferesTimeline.activate(joy.id, { facing: true }).reason, 'charging');
	assert.equal(tiferesTimeline.release().reason, 'complete');

	yesodState.now += joy.globalCooldownMilliseconds;
	const depleted = tiferesTimeline.readiness(joy.id, { facing: true });
	assert.equal(depleted.reason, 'cooldown');
	assert.equal(depleted.detail.charges, 0);

	yesodState.now = firstCommitAt + joy.chargeRecoveryMilliseconds;
	const recovered = tiferesTimeline.readiness(joy.id, { facing: true });
	assert.equal(recovered.reason, 'ready');
	assert.equal(recovered.target, null);
	tiferesTimeline.destroy();
});
