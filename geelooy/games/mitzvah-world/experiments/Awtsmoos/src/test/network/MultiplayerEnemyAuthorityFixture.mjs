// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerEnemyAuthorityFixture.mjs
 * @description Builds authoritative client, actor, runtime, creature, and cast fixtures.
 * The Awtsmoos lets one contract observe one complete authority vessel; Awtsmoos.com keeps
 * calls, possessions, quest progress, geometry, server receipts, and cast stubs reusable.
 */

export function authorityFixture() {
	const calls = [];
	const state = { dedicatedDefeats: 0, quantity: 0 };
	const runtime = runtimeFixture(state);
	const actor = actorFixture(runtime);
	runtime.enemies.actors.push(actor);
	return {
		actor,
		calls,
		client: clientFixture(calls),
		runtime,
		state
	};
}

export function castCombatFixture(target) {
	return {
		cast: null,
		castPayload: () => ({}),
		cooldownRemaining: () => 0,
		distanceTo: () => 10,
		faceTarget() {},
		reject: (code, payload) => ({ accepted: false, code, payload }),
		runtime: {
			bus: { emit() {} },
			enemies: { selected: target },
			enemyAuthority: {
				controls: () => true,
				rangeFor: () => 4.2
			}
		}
	};
}

export function creature(status, health, lootStatus) {
	return {
		health,
		id: 'dybbuk-1',
		lootStatus,
		maximumHealth: 28,
		position: { x: 4, y: 0, z: 5 },
		status
	};
}

function runtimeFixture(state) {
	return {
		bus: { emit() {} },
		enemies: { actors: [] },
		inventory: {
			add: (_id, value) => { state.quantity += value; },
			quantity: () => state.quantity,
			remove: (_id, value) => { state.quantity -= value; }
		},
		quest: {
			recordDefeat() {
				state.dedicatedDefeats += 1;
			}
		},
		questStore: { synchronize() {} }
	};
}

function actorFixture(runtime) {
	return {
		action: 'idle',
		alive: true,
		bus: runtime.bus,
		deathTime: 0,
		group: { position: { x: 0, y: 0, z: 0 }, visible: true },
		health: 28,
		looted: false,
		moving: false,
		payload: () => ({ id: 'even-koved' }),
		profile: { id: 'even-koved', maxHealth: 28 },
		runtime,
		selected: false
	};
}

function clientFixture(calls) {
	return {
		mmorpg: { rpg: {
			attack: async (creatureId, weaponId, intent) => {
				calls.push(['attack', creatureId, weaponId, intent]);
				return { payload: attackPayload() };
			},
			loot: async creatureId => {
				calls.push(['loot', creatureId]);
				return { payload: lootPayload() };
			}
		} }
	};
}

function attackPayload() {
	return {
		adventures: {},
		creature: creature('defeated', 0, 'available'),
		damage: 9,
		refinedSparks: 1
	};
}

function lootPayload() {
	return {
		adventures: {},
		creature: creature('defeated', 0, 'claimed'),
		inventory: {
			inventory: [{ itemId: 'shadow-remnant', quantity: 1 }]
		},
		loot: { itemId: 'shadow-remnant', quantity: 1 }
	};
}
