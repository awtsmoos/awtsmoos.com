// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createDefaultGameState } from '../../js/data/database.js';
import { malkuthCampaignMaps } from '../../js/data/maps/malkuthCampaign/index.js';
import { doorConditionMet } from '../../js/workers/world/door/condition.js';

/**
 * @file Verifies that Malkuth is an authored play space rather than five shells.
 * @description The Awtsmoos renews map, deed, resident, and gate together. This
 * simulation witnesses those relationships directly, so Awtsmoos.com may carry
 * evidence of a living first region instead of another flattering content count.
 */

const expectedMapIds = [
	'malkuth_orchard',
	'malkuth_fields',
	'malkuth_granary',
	'abandoned_cistern',
	'cistern_depths'
];

function entities() {
	return Object.values(malkuthCampaignMaps)
		.flatMap((map) => Object.values(map.interactables || {}));
}

function eventCount(type, targetId) {
	return entities().filter((entity) =>
		entity.questEvent?.type === type && entity.questEvent?.targetId === targetId
	).length;
}

function assertMapShape(mapId, map) {
	const rows = map.baseLayerString.trim().split('\n');
	assert.equal(rows.length, 9, `${mapId} must contain nine authored rows`);
	for (const row of rows) {
		assert.equal(Array.from(row.trim()).length, map.width, `${mapId} row width mismatch`);
	}
	const residents = Object.values(map.interactables).filter((entity) => entity.type === 'npc');
	assert.ok(residents.length >= 2, `${mapId} needs two named residents`);
	assert.equal(
		Object.values(map.interactables).some((entity) => entity.type === 'quest_focus'),
		false,
		`${mapId} must not use generic Chronicle completion`
	);
}

function assertUniqueIds() {
	for (const [mapId, map] of Object.entries(malkuthCampaignMaps)) {
		const ids = Object.values(map.interactables).map((entity) => entity.id).filter(Boolean);
		assert.equal(new Set(ids).size, ids.length, `${mapId} contains duplicate entity identities`);
	}
}

function assertRoads() {
	const roads = [
		['malkuth_orchard', 'malkuth_village'],
		['malkuth_orchard', 'malkuth_fields'],
		['malkuth_fields', 'malkuth_granary'],
		['malkuth_granary', 'abandoned_cistern'],
		['abandoned_cistern', 'cistern_depths'],
		['cistern_depths', 'yesod_shore']
	];
	for (const [mapId, targetMap] of roads) {
		assert.ok(
			Object.values(malkuthCampaignMaps[mapId].interactables)
				.some((entity) => entity.type === 'door' && entity.targetMap === targetMap),
			`${mapId} must connect to ${targetMap}`
		);
	}
}

function assertGates() {
	const state = createDefaultGameState();
	const messages = [];
	const depths = malkuthCampaignMaps.cistern_depths.interactables;
	assert.equal(doorConditionMet(state, depths.cistern_return, (message) => messages.push(message)), false);
	assert.match(messages[0].dialogue.text, /Splitstone Golem/);
	state.player.worldChanges.defeatedBosses = { splitstone_golem: true };
	assert.equal(doorConditionMet(state, depths.cistern_return, () => {}), true);
	assert.equal(doorConditionMet(state, depths.yesod_gate, () => {}), false);
	state.player.completedQuests.push('campaign_malkuth_08');
	assert.equal(doorConditionMet(state, depths.yesod_gate, () => {}), true);
}

assert.deepEqual(Object.keys(malkuthCampaignMaps), expectedMapIds);
for (const [mapId, map] of Object.entries(malkuthCampaignMaps)) {
	assertMapShape(mapId, map);
}
assertUniqueIds();
assertRoads();
assert.equal(eventCount('follow_trail', 'silver_letters'), 3);
assert.equal(eventCount('gather_node', 'scribe_reed'), 5);
assert.equal(entities().filter((entity) => entity.pickup === 'river_ink').length, 3);
assert.equal(eventCount('inspect_clue', 'strange_footprint'), 5);
assert.equal(eventCount('inspect_object', 'damaged_grain_sack'), 4);
assert.equal(eventCount('activate_object', 'husks_cleansed'), 3);
assert.equal(eventCount('visit_order', 'footprint_trail'), 2);
assert.equal(eventCount('activate_sequence', 'cistern_wheels'), 3);
assert.equal(eventCount('solve_puzzle', 'cistern_channels'), 1);
assert.equal(eventCount('escort_npc', 'eli_child'), 1);
assert.equal(eventCount('protect_target', 'eli_ambush'), 1);
assert.equal(
	malkuthCampaignMaps.cistern_depths.encounters['⬜'][0].onceFlag,
	'splitstone_golem'
);
assertGates();

console.log(JSON.stringify({
	ok: true,
	maps: expectedMapIds.length,
	entities: entities().length,
	genericQuestFocuses: 0
}, null, 2));
