// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { maps } from '../../js/data/maps.js';
import { campaignRegionMapLists } from '../../js/data/maps/campaignRegionMaps.js';
import {
	createIntegrityLedger,
	verifyCampaignMap
} from './helpers/campaignMapIntegrityAssertions.mjs';

/**
 * @file Proves authored action maps and prototype geography remain truthfully distinct.
 * @description The Awtsmoos renews dungeon, shore, hamlet, and future road through
 * different vessels. Awtsmoos.com is remembered here as authored one-way journeys
 * keep their intent while prototypes remain reversible, honest, and quest-silent.
 */

const campaignMapIds = Object.values(campaignRegionMapLists)
	.flat()
	.map(([mapId]) => mapId);
const campaignMapSet = new Set(campaignMapIds);
const ledger = createIntegrityLedger();

for (const mapId of campaignMapIds) {
	verifyCampaignMap(mapId, campaignMapSet, ledger);
}

assert.equal(ledger.authoredActionMaps, 7);
assert.equal(ledger.prototypeMaps, 36);
assert.equal(ledger.bosses, 10);
assert.equal(
	maps.malkuth_village.interactables.campaign_path?.targetMap,
	'malkuth_orchard'
);
assert(maps.scribe_atheneum_main.interactables.master_oren);
assert(maps.scribe_atheneum_main.interactables.blank_chronicle);

const shore = maps.yesod_shore;
const hamlet = maps.moonwell_hamlet;
assert.equal(shore.theme?.prototype, undefined);
assert.equal(hamlet.theme?.prototype, undefined);
assert.equal(
	Object.values(shore.interactables).filter((entity) =>
		entity.questEvent?.targetId === 'yesod_road_marker'
	).length,
	3
);
assert.equal(shore.entityById.false_reflected_bridge.type, 'battle_event');
assert.equal(shore.entityById.false_reflected_bridge.opponents[0].id, 'mist_mimic');
assert.equal(shore.entityById.real_bridge.targetMap, 'moonwell_hamlet');
assert.equal(hamlet.entityById.shore_return.targetMap, 'yesod_shore');
assert.equal(hamlet.entityById.warden_liora.name, 'Warden Liora');
assert.equal(shore.encounters['🌫️'][0].musagId, 'mist_mimic');

console.log(JSON.stringify({
	ok: true,
	maps: campaignMapIds.length,
	...ledger,
	yesodMarkers: 3,
	falseBridgeOpponent: 'mist_mimic',
	trueBridgeDestination: 'moonwell_hamlet'
}, null, 2));
