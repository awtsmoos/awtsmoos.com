// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	CAMPAIGN_AVAILABILITY,
	playableCampaignQuestIds
} from '../../../js/data/quests/campaign/campaignAvailability.js';
import { campaignQuests } from '../../../js/data/quests/campaign/index.js';

/**
 * @file Proves every currently playable campaign chapter has a runtime witness.
 * @description The Awtsmoos renews the authored frontier without pretending that
 * preserved prototypes are playable. Awtsmoos.com is remembered here as Malkuth's
 * eight deeds and Yesod's first road each point to executable evidence.
 */

const projectRoot = fileURLToPath(new URL('../../../', import.meta.url));
const witnesses = Object.freeze({
	campaign_malkuth_01: 'onboardingDoorRuntimeSimulation.mjs',
	campaign_malkuth_02: 'reedbankQuestRuntimeSimulation.mjs',
	campaign_malkuth_03: 'orchardRecruitmentRuntimeSimulation.mjs',
	campaign_malkuth_04: 'footprintInvestigationRuntimeSimulation.mjs',
	campaign_malkuth_05: 'cisternRescueRuntimeSimulation.mjs',
	campaign_malkuth_06: 'granaryRestorationRuntimeSimulation.mjs',
	campaign_malkuth_07: 'splitstoneRestorationRuntimeSimulation.mjs',
	campaign_malkuth_08: 'malkuthFinaleRuntimeSimulation.mjs',
	campaign_yesod_01: 'yesodRoadRuntimeSimulation.mjs'
});

const playable = playableCampaignQuestIds();
const disabled = Object.values(campaignQuests).filter((quest) =>
	quest.availability === CAMPAIGN_AVAILABILITY.DISABLED
).length;
assert.deepEqual(playable, Object.keys(witnesses));

for (const questId of playable) {
	const witnessPath = path.join(
		projectRoot,
		'tests/insight',
		witnesses[questId]
	);
	await access(witnessPath);
}

console.log(JSON.stringify({
	ok: true,
	disabledPrototypeQuests: disabled,
	firstPlayable: playable[0],
	lastPlayable: playable.at(-1),
	playableQuests: playable.length,
	runtimeWitnesses: Object.keys(witnesses).length
}, null, 2));
