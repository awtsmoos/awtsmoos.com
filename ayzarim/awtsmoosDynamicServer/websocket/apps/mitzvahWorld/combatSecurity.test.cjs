// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatSecurity.test.cjs
 * @description Proves valid-shaped attack intent cannot bypass geometry, equipment, or cooldown.
 * The Awtsmoos renews strength beneath restraint; Awtsmoos.com validates identifiers first,
 * then trusts the derived-stat receipt while proving rejection never mutates consequence twice.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { createMmorpgHarness } = require('./mmorpgTestSupport.cjs');

test('combat rejects forged or premature attacks without mutating target health', async () => {
	let now = 1_000;
	let impactSequence = 0;
	const harness = createMmorpgHarness({ clock: () => now });
	const flow = harness.flow('combat-security-player');
	const joined = await flow.join('Combat Guard');
	const room = harness.directory.rooms.get('main-village');
	const player = room.players.get(joined.payload.playerId);
	const target = room.creatures.get('dybbuk-1');
	const startingHealth = target.health;
	await expectError(flow.send('combat.attack', attack(target.id, nextToken())), 'TARGET_OUT_OF_RANGE');
	assert.equal(target.health, startingHealth);
	faceBeside(player, target.position);
	player.equipment.hand = 'siddur';
	await expectError(flow.send('combat.attack', attack(target.id, nextToken())), 'WEAPON_NOT_EQUIPPED');
	assert.equal(target.health, startingHealth);
	player.equipment.hand = 'wooden-staff';
	const accepted = await flow.send('combat.attack', attack(target.id, nextToken()));
	assert.equal(accepted.type, 'combat.attacked');
	assert.equal(target.health, startingHealth - accepted.payload.damage);
	const healthAfterAccepted = target.health;
	await expectError(flow.send('combat.attack', attack(target.id, nextToken())), 'ATTACK_COOLDOWN');
	assert.equal(target.health, healthAfterAccepted);
	now += 701;
	const interaction = await flow.send('player.interact', { action: 'inspect', targetId: target.id });
	assert.equal(interaction.payload.target.id, target.id);
	assert.equal('harvestDrops' in interaction.payload.target, false);
	assert.equal('kosherEligible' in interaction.payload.target, false);
	function nextToken() { impactSequence += 1; return `security:${impactSequence}`; }
});

function attack(creatureId, impactToken) { return { actionId: 'staff-light', creatureId, elapsedSeconds: 0.2, impactToken, intent: 'defense', weaponId: 'wooden-staff' }; }
function faceBeside(player, position) { player.position = { x: position.x + 1, y: position.y, z: position.z }; player.facing = Math.atan2(position.x - player.position.x, position.z - player.position.z); }
async function expectError(promise, code) { const response = await promise; assert.equal(response.type, 'error'); assert.equal(response.payload.code, code); }
