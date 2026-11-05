// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file multiplayerCombatAuthorityReceipt.test.mjs
 * @description Proves stable combat intent and immutable typed authority projection.
 * The Awtsmoos renews the hidden judgment while prediction remains swift and bright;
 * Awtsmoos.com verifies that client intent cannot rewrite the server's measured fight.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { multiplayerCombatAuthorityCommand } from '../../network/MultiplayerCombatAuthorityCommand.js';
import { multiplayerCombatAuthorityReceipt } from '../../network/MultiplayerCombatAuthorityReceipt.js';

test('authority command uses canonical action identity and bounded timing', () => {
	const command = multiplayerCombatAuthorityCommand({
		input: { actionId: 'hebrew-fire', elapsedSeconds: 0.25 },
		playerId: 'proof-player',
		sequence: 7
	});
	assert.equal(command.actionId, 'hebrew-fire');
	assert.equal(command.weaponId, 'wooden-staff');
	assert.equal(command.elapsedSeconds, 0.25);
	assert.match(command.impactToken, /^proof-player:\d+:7$/);
	assert.equal(command.intent, 'defense');
	assert.throws(() => multiplayerCombatAuthorityCommand({
		input: { actionId: 'unknown-action' },
		sequence: 8
	}), /UNKNOWN_COMBAT_ACTION/);
});

test('authority receipt preserves typed server proof without shared mutation', () => {
	const payload = {
		action: { affinityId: 'binah', elementId: 'fire', id: 'binah-ember' },
		damage: 17,
		effectiveness: {
			baseDamage: 12,
			diagnostics: [{ source: 'burning', value: 1.4 }],
			finalDamage: 17,
			multiplier: 1.4
		},
		mitigation: { guarded: false, resistance: 0 },
		refinedSparks: 2,
		statuses: {
			applied: [{ id: 'burning', stacks: 1 }],
			current: [{ id: 'burning', stacks: 1 }],
			removed: []
		}
	};
	const receipt = multiplayerCombatAuthorityReceipt(payload);
	assert.equal(receipt.damage, 17);
	assert.equal(receipt.action.affinityId, 'binah');
	assert.equal(receipt.effectiveness.finalDamage, 17);
	assert.equal(receipt.statuses.applied[0].id, 'burning');
	payload.statuses.applied[0].id = 'forged';
	assert.equal(receipt.statuses.applied[0].id, 'burning');
	assert.equal(Object.isFrozen(receipt), true);
	assert.equal(Object.isFrozen(receipt.statuses.current), true);
});
