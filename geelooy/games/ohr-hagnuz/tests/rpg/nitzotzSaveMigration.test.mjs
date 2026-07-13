// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nitzotzSaveMigration.test.mjs
 * @description Proves version-two saves gain bond vessels without losing memory.
 *
 * The Awtsmoos renews an old road inside a new present without erasing a single
 * earned step. This test protects party identity, mission leads, world weather,
 * and additive companion fields through the third save revelation at Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { migrateEnvelope } from '../../src/yesod/save/SaveMigrations.js';
import { SAVE_SCHEMA_VERSION } from '../../src/yesod/save/SaveSchema.js';

const oldEnvelope = {
	schemaVersion: 2,
	data: {
		MapId: 'Overworld_Main',
		Party: {
			starterId: 'orli',
			active: [{ id: 'orli', name: 'Orli', level: 4, bond: 18 }],
			reserve: [],
			known: { orli: true },
			leadIndex: 0,
			maximumActive: 3,
			bond: { orli: 18 },
			evolutions: {}
		},
		Missions: {
			active: {},
			completed: ['prologue_broken_aleph'],
			history: []
		},
		WorldState: {
			weather: { type: 'RAIN', intensity: 2 }
		}
	}
};

const migrated = migrateEnvelope(oldEnvelope);
assert.equal(migrated.schemaVersion, SAVE_SCHEMA_VERSION);
assert.equal(migrated.data.MapId, 'Overworld_Main');
assert.equal(migrated.data.Party.active[0].name, 'Orli');
assert.equal(migrated.data.Party.bond.orli, 18);
assert.deepEqual(migrated.data.Party.abilities, {});
assert.deepEqual(migrated.data.Party.bondHistory, []);
assert.deepEqual(migrated.data.Missions.companionLeads, {});
assert.ok(migrated.data.Missions.completed.includes('prologue_broken_aleph'));
assert.equal(migrated.data.WorldState.weather.type, 'RAIN');
assert.deepEqual(migrated.data.WorldState.flags, {});
console.log('BH_NITZOTZ_SAVE_MIGRATION_PASS');
