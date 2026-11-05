// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeadowCombatDownlink.test.mjs
 * @description Proves the multiplayer combat downlink for stream 4:
 * client catalog ids match the real server CreatureSpawnCatalog, catalog
 * species agree with the canonical affinity alias map, server echoes of our
 * own attacks never double-apply damage (idempotency), remote players' hits
 * do apply, creature deltas merge into world.creatures, and the meadow keeps
 * local authority over enemy positions.
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import {
	authoritativeCombatAction,
	multiplayerEnemyAuthorityRecords,
	multiplayerEnemyRecord
} from '../MultiplayerEnemyAuthorityCatalog.js';
import {
	MINIMAL_MEADOW_COMBAT_ACTIONS
} from '../../app/MinimalMeadowCombatActions.js';
import {
	applyAuthoritativeAttackResponse
} from '../MultiplayerEnemyAuthorityAttack.js';
import {
	applyAuthoritativeWorldCreatures
} from '../MultiplayerEnemyAuthoritySync.js';
import {
	applyWorldDelta
} from '../WorldDeltaStore.js';
import {
	canonicalEnemyAffinityId
} from '../../gameplay/affinity/EnemyAffinityAliasMap.js';

const require = createRequire(import.meta.url);
const { SPAWNS } = require(
	'../../../../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld/CreatureSpawnCatalog.js'
);
const SERVER_SPAWNS = new Map(SPAWNS.map(spawn => [spawn.id, spawn]));

test('every catalog creatureId exists on the server with the catalog speciesId', () => {
	for (const record of multiplayerEnemyAuthorityRecords()) {
		const spawn = SERVER_SPAWNS.get(record.creatureId);
		assert.ok(spawn, `server has no creature ${record.creatureId}`);
		assert.equal(
			spawn.speciesId,
			record.speciesId,
			`${record.creatureId} species mismatch`
		);
	}
});

test('catalog speciesId agrees with the canonical affinity alias map', () => {
	for (const record of multiplayerEnemyAuthorityRecords()) {
		assert.equal(
			record.speciesId,
			canonicalEnemyAffinityId(record.profileId),
			`${record.profileId}: catalog species drifted from alias map`
		);
	}
});

test('kedem-letter-warden is bound (no longer stuck on the local-only path)', () => {
	const record = multiplayerEnemyRecord('kedem-letter-warden');
	assert.ok(record);
	assert.equal(record.creatureId, 'kedem-warden-1');
});

// guarded-thought has no server combat action definition, so the server
// cannot resolve it; every other damaging meadow action must uplink.
const KNOWN_SERVER_ACTION_GAP = new Set(['guarded-thought']);

test('every damaging meadow action maps to a server combat.attack action', () => {
	const missing = [];
	for (const [id, action] of Object.entries(MINIMAL_MEADOW_COMBAT_ACTIONS)) {
		const offensive = action.type === 'melee'
			|| (action.type === 'cast' && Number(action.damage || 0) > 0);
		if (!offensive || KNOWN_SERVER_ACTION_GAP.has(id)) continue;
		if (!authoritativeCombatAction(id)) missing.push(id);
	}
	assert.deepEqual(missing, []);
});

function createActor(positionSync = false) {
	const events = [];
	const defeats = [];
	return {
		actor: {
			action: 'idle',
			alive: true,
			authoritative: true,
			authoritativeDefeatRecorded: false,
			bus: {
				emit(type, payload) {
					events.push({ payload, type });
				}
			},
			deathTime: 0,
			group: {
				position: { x: -50, y: 1, z: -10 },
				visible: true
			},
			health: 100,
			looted: false,
			moving: true,
			profile: { id: 'tzel-chai', maxHealth: 96 },
			selected: false,
			serverCreatureId: 'guardian-1',
			runtime: {
				authoritativeEnemyPositionSync: positionSync ? undefined : false,
				quest: {
					recordDefeat() {
						defeats.push(1);
					}
				}
			},
			payload() {
				return { id: 'tzel-chai' };
			}
		},
		defeats,
		events
	};
}

function serverCreature(overrides = {}) {
	return {
		action: null,
		health: 90,
		id: 'guardian-1',
		lootStatus: 'unavailable',
		maximumHealth: 90,
		phase: null,
		position: { x: -58, y: 0, z: -18 },
		role: null,
		status: 'active',
		...overrides
	};
}

function createBridge() {
	return {
		client: {},
		runtime: {
			bus: { emit() {} },
			questStore: null
		}
	};
}

test('own attack echo does not double-apply damage (idempotency)', () => {
	const { actor } = createActor();
	const bridge = createBridge();
	const struck = serverCreature({ health: 70 });
	applyAuthoritativeAttackResponse(bridge, actor, {
		adventures: [],
		creature: struck,
		damage: 20
	});
	assert.equal(actor.health, 70);
	// The server echo arrives later through world.changed with identical truth.
	applyAuthoritativeWorldCreatures(
		{ enemies: { actors: [actor] } },
		{ creatures: [serverCreature({ health: 70 })] },
		candidate => candidate === actor
	);
	assert.equal(actor.health, 70);
	assert.equal(actor.alive, true);
});

test("a remote player's hit on the same creature applies once", () => {
	const { actor } = createActor();
	applyAuthoritativeWorldCreatures(
		{ enemies: { actors: [actor] } },
		{ creatures: [serverCreature({ health: 40 })] },
		candidate => candidate === actor
	);
	assert.equal(actor.health, 40);
});

test('defeat echo is recorded exactly once', () => {
	const { actor, defeats } = createActor();
	const bridge = createBridge();
	const dead = serverCreature({ health: 0, status: 'defeated' });
	applyAuthoritativeAttackResponse(bridge, actor, {
		adventures: [],
		creature: dead,
		damage: 90
	});
	assert.equal(actor.alive, false);
	assert.equal(defeats.length, 1);
	applyAuthoritativeWorldCreatures(
		{ enemies: { actors: [actor] } },
		{ creatures: [serverCreature({ health: 0, status: 'defeated' })] },
		candidate => candidate === actor
	);
	assert.equal(defeats.length, 1);
	assert.equal(actor.alive, false);
});

test('meadow keeps local authority over enemy positions (no server pin)', () => {
	const { actor } = createActor(false);
	applyAuthoritativeWorldCreatures(
		{ enemies: { actors: [actor] } },
		{ creatures: [serverCreature()] },
		candidate => candidate === actor
	);
	assert.deepEqual(actor.group.position, { x: -50, y: 1, z: -10 });
});

test('world deltas merge creature updates into world.creatures', () => {
	const world = {
		creatures: [{ id: 'guardian-1', health: 90 }],
		npcs: [{ id: 'n1' }],
		players: [{ id: 'p1' }],
		revision: 1
	};
	const next = applyWorldDelta(world, {
		revision: 2,
		updated: [{ entityType: 'creature', health: 70, id: 'guardian-1' }]
	});
	assert.equal(next.creatures.length, 1);
	assert.equal(next.creatures[0].health, 70);
	assert.equal(next.players.length, 1);
	assert.equal(next.npcs.length, 1);
	assert.ok(
		next.players.every(entity => entity.id !== 'guardian-1'),
		'creature must not leak into players'
	);
	assert.ok(
		next.npcs.every(entity => entity.id !== 'guardian-1'),
		'creature must not leak into npcs'
	);
});

test('world deltas add and remove creatures', () => {
	const world = { creatures: [], npcs: [], players: [], revision: 3 };
	const added = applyWorldDelta(world, {
		entered: [{ entityType: 'creature', health: 45, id: 'dybbuk-1' }],
		revision: 4
	});
	assert.equal(added.creatures.length, 1);
	const removed = applyWorldDelta(added, {
		left: ['dybbuk-1'],
		revision: 5
	});
	assert.equal(removed.creatures.length, 0);
});
