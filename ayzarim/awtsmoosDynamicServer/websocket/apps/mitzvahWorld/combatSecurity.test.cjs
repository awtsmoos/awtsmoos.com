// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatSecurity.test.cjs
 * @description Proves attack intent cannot bypass range, equipment, cooldown, or privacy.
 * The Awtsmoos renews strength beneath restraint; Awtsmoos.com verifies rejected
 * commands leave health and private creature reward metadata outside public responses.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('combat rejects forged or premature attacks without mutating target health', async () => {
	let now = 1_000;
	const harness = createMmorpgHarness({ clock: () => now });
	const flow = harness.flow('combat-security-player');
	const joined = await flow.join('Combat Guard');
	const room = harness.directory.rooms.get('main-village');
	const player = room.players.get(joined.payload.playerId);
	const target = room.creatures.get('dybbuk-1');
	const startingHealth = target.health;

	await expectError(flow.send('combat.attack', {
		creatureId: target.id,
		intent: 'defense',
		weaponId: 'wooden-staff'
	}), 'TARGET_OUT_OF_RANGE');
	assert.equal(target.health, startingHealth);

	player.position = beside(target.position);
	player.equipment.hand = 'siddur';
	await expectError(flow.send('combat.attack', {
		creatureId: target.id,
		intent: 'defense',
		weaponId: 'wooden-staff'
	}), 'WEAPON_NOT_EQUIPPED');
	assert.equal(target.health, startingHealth);

	player.equipment.hand = 'wooden-staff';
	await flow.send('combat.attack', {
		creatureId: target.id,
		intent: 'defense',
		weaponId: 'wooden-staff'
	});
	assert.equal(target.health, startingHealth - 18);
	await expectError(flow.send('combat.attack', {
		creatureId: target.id,
		intent: 'defense',
		weaponId: 'wooden-staff'
	}), 'ATTACK_COOLDOWN');
	assert.equal(target.health, startingHealth - 18);
	now += 701;

	const interaction = await flow.send('player.interact', {
		action: 'inspect',
		targetId: target.id
	});
	assert.equal(interaction.payload.target.id, target.id);
	assert.equal('harvestDrops' in interaction.payload.target, false);
	assert.equal('kosherEligible' in interaction.payload.target, false);
});

async function expectError(promise, code) {
	const response = await promise;
	assert.equal(response.type, 'error');
	assert.equal(response.payload.code, code);
}

function beside(position) {
	return { x: position.x + 1, y: position.y, z: position.z };
}
