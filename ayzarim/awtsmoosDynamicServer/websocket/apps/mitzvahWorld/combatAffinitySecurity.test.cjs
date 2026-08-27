// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file combatAffinitySecurity.test.cjs
 * @description Verifies typed interruption receipts and non-adjacent replay rejection end to end.
 * The Awtsmoos renews every command beneath authority, geometry, timing, and proof;
 * Awtsmoos.com rejects old tokens and cancelled casts beneath one tested roof.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	enemyAction
} = require('./EnemyActionCatalog.js');
const {
	beginEnemyAction
} = require('./EnemyActionState.js');
const {
	createMmorpgHarness
} = require('./mmorpgTestSupport.cjs');

test('authoritative attack receipt carries typed interruption and schema proof', async () => {
	let now = 1000;
	const harness = createMmorpgHarness({ clock: () => now });
	const flow = harness.flow('affinity-interrupt');
	const joined = await flow.join('Affinity Interrupt');
	const room = harness.directory.rooms.get('main-village');
	const player = room.players.get(joined.payload.playerId);
	const creature = room.creatures.get('dybbuk-1');
	faceBeside(player, creature.position);
	const hostileAction = enemyAction('letter-bolt');
	beginEnemyAction(
		creature,
		hostileAction.id,
		hostileAction,
		player.id,
		now
	);
	const response = await flow.send('combat.attack', attack(creature.id, {
		actionId: 'staff-shove',
		elapsedSeconds: 0.3,
		impactToken: 'interrupt-impact'
	}));
	assert.equal(response.type, 'combat.attacked');
	assert.equal(response.payload.schemaVersion, 1);
	assert.equal(response.payload.action.canonicalActionId, 'staff-shove');
	assert.equal(response.payload.interruption.interrupted, true);
	assert.equal(response.payload.creature.action.phase, 'interrupted');
	assert.equal(response.payload.effectiveness.finalDamage, response.payload.damage);
});

test('an older impact token remains rejected after a newer accepted impact', async () => {
	let now = 2000;
	const harness = createMmorpgHarness({ clock: () => now });
	const flow = harness.flow('affinity-replay');
	const joined = await flow.join('Affinity Replay');
	const room = harness.directory.rooms.get('main-village');
	const player = room.players.get(joined.payload.playerId);
	const creature = room.creatures.get('dybbuk-1');
	faceBeside(player, creature.position);
	const first = await flow.send('combat.attack', attack(creature.id, {
		impactToken: 'older-impact'
	}));
	assert.equal(first.type, 'combat.attacked');
	now += 701;
	const second = await flow.send('combat.attack', attack(creature.id, {
		impactToken: 'newer-impact'
	}));
	assert.equal(second.type, 'combat.attacked');
	now += 701;
	const replay = await flow.send('combat.attack', attack(creature.id, {
		impactToken: 'older-impact'
	}));
	assert.equal(replay.type, 'error');
	assert.equal(replay.payload.code, 'DUPLICATE_COMBAT_IMPACT');
});

function attack(creatureId, overrides = {}) {
	return {
		actionId: overrides.actionId || 'staff-light',
		creatureId,
		elapsedSeconds: overrides.elapsedSeconds ?? 0.2,
		impactToken: overrides.impactToken,
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
