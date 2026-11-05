// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos does not recreate an unchanged garment needlessly; these proofs ensure identical
 * cooldown presentation produces no second DOM write in the action bar of Awtsmoos.com.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { updateActionSlotCooldown } from '../../ui/ActionBarSlotView.js';

function fakeButton() {
	const time = { textContent: '' };
	const charge = { hidden: false, textContent: '' };
	const styleWrites = [];
	return {
		button: {
			dataset: {},
			querySelector(selector) {
				return selector.includes('cooldown-time') ? time : charge;
			},
			style: {
				setProperty(name, value) {
					styleWrites.push({ name, value });
				}
			}
		},
		charge,
		styleWrites,
		time
	};
}

const definition = Object.freeze({
	chargeRecoveryMilliseconds: 0,
	charges: 1,
	cooldownMilliseconds: 1000,
	globalCooldownMilliseconds: 1500
});

function state(overrides = {}) {
	return {
		charges: 1,
		cooldownRemainingMilliseconds: 500,
		globalCooldownRemainingMilliseconds: 0,
		maximumCharges: 1,
		...overrides
	};
}

test('identical cooldown state writes once', () => {
	const view = fakeButton();
	assert.equal(updateActionSlotCooldown(view.button, definition, state()), true);
	assert.equal(updateActionSlotCooldown(view.button, definition, state()), false);
	assert.deepEqual(view.styleWrites, [
		{ name: '--cooldown-ratio', value: '0.500' }
	]);
	assert.equal(view.time.textContent, '0.5');
	assert.equal(view.charge.hidden, true);
});

test('a changed sweep ratio performs one new presentation write', () => {
	const view = fakeButton();
	updateActionSlotCooldown(view.button, definition, state());
	assert.equal(updateActionSlotCooldown(
		view.button,
		definition,
		state({ cooldownRemainingMilliseconds: 450 })
	), true);
	assert.equal(view.styleWrites.length, 2);
	assert.equal(view.styleWrites[1].value, '0.450');
});

test('charge presentation participates in the signature', () => {
	const view = fakeButton();
	const chargedDefinition = {
		...definition,
		chargeRecoveryMilliseconds: 4000,
		charges: 2
	};
	assert.equal(updateActionSlotCooldown(
		view.button,
		chargedDefinition,
		state({ charges: 1, maximumCharges: 2 })
	), true);
	assert.equal(view.charge.hidden, false);
	assert.equal(view.charge.textContent, '1');
});
