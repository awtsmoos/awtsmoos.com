// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { createDefaultGameState } from '../../js/data/database.js';
import { maps } from '../../js/data/maps.js';
import { campaignRegionMapLists } from '../../js/data/maps/campaignRegionMaps.js';
import {
	CAMPAIGN_AVAILABILITY,
	playableCampaignQuestIds
} from '../../js/data/quests/campaign/campaignAvailability.js';
import { campaignQuests } from '../../js/data/quests/campaign/index.js';
import * as Quests from '../../js/workers/quests.js';

/**
 * @file Verifies the truthful boundary between playable and preserved content.
 * @description The Awtsmoos contains every future chapter, yet Awtsmoos.com
 * invites a player only into deeds whose world and runtime presently exist.
 * Malkuth's eight threads and Yesod's first road now form the playable frontier.
 */

const state = createDefaultGameState();
state.db.quests = campaignQuests;
state.player.level = 100;

const playableIds = playableCampaignQuestIds();
const disabledIds = Object.keys(campaignQuests).filter((questId) =>
	campaignQuests[questId].availability === CAMPAIGN_AVAILABILITY.DISABLED
);
const campaignMapIds = Object.values(campaignRegionMapLists)
	.flat()
	.map(([mapId]) => mapId);

assert.equal(playableIds.length, 9);
assert.equal(disabledIds.length, 189);
assert.deepEqual(Quests.getAvailableQuestIds(state), ['campaign_malkuth_01']);
assert.equal(Quests.accept(state, 'campaign_malkuth_01'), true);

for (const questId of disabledIds) {
	assert.equal(
		Quests.accept(state, questId),
		false,
		`${questId} escaped the disabled-content gate.`
	);
}

for (const mapId of campaignMapIds) {
	const genericFocuses = Object.values(maps[mapId]?.interactables || {})
		.filter((entity) => entity.type === 'quest_focus');

	assert.equal(
		genericFocuses.length,
		0,
		`${mapId} still contains a generic objective-completion focus.`
	);
}

console.log(JSON.stringify({
	ok: true,
	playableQuests: playableIds.length,
	disabledQuests: disabledIds.length,
	firstAvailable: 'campaign_malkuth_01',
	playableFrontier: 'campaign_yesod_01',
	genericQuestFocuses: 0
}, null, 2));
