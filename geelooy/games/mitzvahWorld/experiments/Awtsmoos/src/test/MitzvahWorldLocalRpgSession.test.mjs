// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldLocalRpgSession.test.mjs
 * @description Proves offline combat rules and parity with the authoritative catalogs.
 * The Awtsmoos renews one law through local and multiplayer vessels; Awtsmoos.com
 * verifies matching weapons, creatures, missions, damage, cooldown, and spark rewards.
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import {
	LOCAL_ADVENTURE_IDS,
	LOCAL_CREATURE_SPAWNS,
	LOCAL_RPG_CREATURES,
	LOCAL_RPG_WEAPONS
} from '../network/LocalRpgCatalog.js';
import { MitzvahWorldLocalRpgSession } from '../network/MitzvahWorldLocalRpgSession.js';

const require = createRequire(import.meta.url);
const serverCatalog = require('../../../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld/CombatantCatalog.js');
const { ADVENTURE_QUESTS } = require('../../../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld/AdventureQuestCatalog.js');
const { SPAWNS } = require('../../../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld/CreatureSpawnCatalog.js');

test('offline RPG catalogs and attack outcomes remain aligned with multiplayer', () => {
	assert.deepEqual(Object.keys(LOCAL_RPG_WEAPONS).sort(), Object.keys(serverCatalog.WEAPONS).sort());
	assert.deepEqual(Object.keys(LOCAL_RPG_CREATURES).sort(), Object.keys(serverCatalog.CREATURES).sort());
	assert.deepEqual(LOCAL_ADVENTURE_IDS, ADVENTURE_QUESTS.map((quest) => quest.id));
	assert.deepEqual(LOCAL_CREATURE_SPAWNS.map((spawn) => spawn.id), SPAWNS.map((spawn) => spawn.id));
	for (const [id, weapon] of Object.entries(LOCAL_RPG_WEAPONS)) {
		assert.deepEqual(weapon, serverCatalog.WEAPONS[id]);
	}

	let now = 1_000;
	const session = new MitzvahWorldLocalRpgSession({ clock: () => now });
	assert.equal(session.snapshot().creatures.length, 18);
	session.startAdventure('sparks-at-east-gate');
	let snapshot = session.attack('dybbuk-1');
	assert.equal(snapshot.creatures.find((item) => item.id === 'dybbuk-1').health, 27);
	assert.throws(() => session.attack('dybbuk-1'), /ATTACK_COOLDOWN/);
	now += 701;
	session.attack('dybbuk-1');
	now += 701;
	snapshot = session.attack('dybbuk-1');
	assert.equal(snapshot.creatures.find((item) => item.id === 'dybbuk-1').status, 'defeated');
	assert.equal(snapshot.refinedSparks, 2);
});
