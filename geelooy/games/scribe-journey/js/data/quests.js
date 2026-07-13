// B"H
// Boruch Hashem
// Blessed is He

import { campaignQuests } from './quests/campaign/index.js';
import { generatePostgameWorldEvent } from './quests/campaign/postgameEvents.js';
import { generateDailyQuest } from './quests/daily.js';
import { expansionQuests } from './quests/expansion_quests.js';
import { ganEdenQuests } from './quests/gan_eden_quests.js';
import { holidayQuests } from './quests/holiday_quests.js';
import { taharotQuests, towerQuests } from './quests/legacy_special.js';
import { mainStoryQuests } from './quests/main_story.js';
import { dibburQuests } from './quests/maamar/dibbur_quests.js';
import { matbeaQuests } from './quests/maamar/matbea_quests.js';
import { ratzonQuests } from './quests/maamar/ratzon_quests.js';
import { tviaQuests } from './quests/maamar/tvia_quests.js';
import { sechirutQuests } from './quests/sechirut_quests.js';
import { shlichusCampaignQuests } from './quests/shlichus_campaigns.js';
import { sideQuests } from './quests/side_stories.js';
import { tanyaQuests } from './quests/tanya.js';
import { kodashimQuests } from './quests/tractate_kodashim.js';
import { moedQuests } from './quests/tractate_moed.js';
import { nashimQuests } from './quests/tractate_nashim.js';
import { nezikinQuests } from './quests/tractate_nezikin.js';
import { tribeQuests } from './quests/tribes.js';
import { yudTetQuests } from './quests/yud_tet_quests.js';

function dailyQuestMap() {
	const dailyQuest = generateDailyQuest(new Date().getDate());
	return { [dailyQuest.id]: dailyQuest };
}

function postgameEventMap() {
	const worldEvent = generatePostgameWorldEvent(new Date());
	return { [worldEvent.id]: worldEvent };
}

/**
 * Every immutable quest definition enters one source-owned Chronicle registry.
 * Mutable status remains with the player so a save records deeds, not databases.
 */
export const quests = Object.freeze({
	...mainStoryQuests,
	...nezikinQuests,
	...taharotQuests,
	...moedQuests,
	...nashimQuests,
	...kodashimQuests,
	...holidayQuests,
	...sechirutQuests,
	...yudTetQuests,
	...matbeaQuests,
	...tviaQuests,
	...dibburQuests,
	...ratzonQuests,
	...tanyaQuests,
	...tribeQuests,
	...ganEdenQuests,
	...sideQuests,
	...expansionQuests,
	...shlichusCampaignQuests,
	...towerQuests,
	...dailyQuestMap(),
	...campaignQuests,
	...postgameEventMap()
});
