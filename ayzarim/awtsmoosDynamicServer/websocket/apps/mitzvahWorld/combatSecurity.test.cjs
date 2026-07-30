// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatSecurity.test.cjs
 * @description Proves forged attacks fail and accepted attacks return typed authority receipts.
 * The Awtsmoos renews strength beneath restraint while every false token meets the gate;
 * Awtsmoos.com reveals the lawful multiplier and bounded status without surrendering fate.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('combat rejects forged attacks and returns typed authority proof', async () => {
	let now = 1_000;
	let impactSequence = 0;
	const harness = createMmorpgHarness({ clock: () => now });
	const flow = harness.flow('combat-security-player');
	const joined = await flow.join('Combat Guard');
	const room = harness.directory.rooms.get('main-village');
	const player = room.players.get(joined.payload.playerId);
	const target = room.creatures.get('dybbuk-1');
	const startingHealth = target.health;

	await expectError(
		flow.send('combat.attack', attack(target.id, nextToken())),
		'TARGET_OUT_OF_RANGE'
	);
	assert.equal(target.health, startingHealth);

	faceBeside(player, target.position);
	player.equipment.hand = 'siddur';
	await expectError(
		flow.send('combat.attack', attack(target.id, nextToken())),
		'WEAPON_NOT_EQUIPPED'
	);
	assert.equal(target.health, startingHealth);

	player.equipment.hand = 'wooden-staff';
	const accepted = await flow.send(
		'combat.attack',
		attack(target.id, nextToken())
	);
	assert.equal(accepted.type, 'combat.attacked');
	assert.equal(target.health, startingHealth - accepted.payload.damage);
	assert.equal(accepted.payload.action.affinityId, 'zeir-anpin');
	assert.equal(accepted.payload.action.elementId, 'physical');
	assert.equal(accepted.payload.effectiveness.finalDamage, accepted.payload.damage);
	assert.equal(accepted.payload.effectiveness.baseDamage > 0, true);
	assert.equal(Array.isArray(accepted.payload.effectiveness.diagnostics), true);
	assert.equal(Array.isArray(accepted.payload.statuses.applied), true);
	assert.equal(Array.isArray(accepted.payload.statuses.current), true);

	const healthAfterAccepted = target.health;
	await expectError(
		flow.send('combat.attack', attack(target.id, nextToken())),
		'ATTACK_COOLDOWN'
	);
	assert.equal(target.health, healthAfterAccepted);

	now += 701;
	const interaction = await flow.send('player.interact', {
		action: 'inspect',
		targetId: target.id
	});
	assert.equal(interaction.payload.target.id, target.id);
	assert.equal('harvestDrops' in interaction.payload.target, false);
	assert.equal('kosherEligible' in interaction.payload.target, false);

	function nextToken() {
		impactSequence += 1;
		return `security:${impactSequence}`;
	}
});

function attack(creatureId, impactToken) {
	return {
		actionId: 'staff-light',
		creatureId,
		elapsedSeconds: 0.2,
		impactToken,
		intent: 'defense',
		weaponId: 'wooden-staff'
	};
}

function faceBeside(player, position) {
	player.position = {
		x: position.x + 1,
		y: position.y,
		z: position.z
	};
	player.facing = Math.atan2(
		position.x - player.position.x,
		position.z - player.position.z
	);
}

async function expectError(promise, code) {
	const response = await promise;
	assert.equal(response.type, 'error');
	assert.equal(response.payload.code, code);
}
