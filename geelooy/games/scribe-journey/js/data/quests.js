
// B"H
// js/data/quests.js

import { mainStoryQuests } from './quests/main_story.js';
import { nezikinQuests } from './quests/tractate_nezikin.js';
import { moedQuests } from './quests/tractate_moed.js';
import { sideQuests } from './quests/side_stories.js';
import { nashimQuests } from './quests/tractate_nashim.js';
import { kodashimQuests } from './quests/tractate_kodashim.js';
import { holidayQuests } from './quests/holiday_quests.js';
import { sechirutQuests } from './quests/sechirut_quests.js';
import { yudTetQuests } from './quests/yud_tet_quests.js';
import { generateDailyQuest } from './quests/daily.js';

import { matbeaQuests } from './quests/maamar/matbea_quests.js';
import { tviaQuests } from './quests/maamar/tvia_quests.js';
import { dibburQuests } from './quests/maamar/dibbur_quests.js';
import { ratzonQuests } from './quests/maamar/ratzon_quests.js';
import { tanyaQuests } from './quests/tanya.js';
import { tribeQuests } from './quests/tribes.js';
import { ganEdenQuests } from './quests/gan_eden_quests.js';
import { expansionQuests } from './quests/expansion_quests.js';
import { shlichusCampaignQuests } from './quests/shlichus_campaigns.js';

const taharotQuests = {
    'mikvaot_1_pure_waters': {
        id: 'mikvaot_1_pure_waters', name: "Waters of Knowledge",
        desc: "The Echo of Rambam speaks of a spiritual impurity clouding the caverns...",
        status: 'locked',
        objectives: [
            { id: 'find_chamber', text: 'Find the hidden Chamber of Pure Waters.', completed: false },
            { id: 'defeat_drawn_water', text: 'Overcome the concept of "Drawn Water".', completed: false, target: {type: 'defeat', musagId: 'drawn_water_elemental', count: 1}},
            { id: 'learn_mikveh_law', text: 'Find the lost page on Hilchot Mikvaot.', completed: false, target: {type: 'acquire', itemId: 'rambam_page_mikvaot'}},
            { id: 'purify_chamber', text: 'Use the true knowledge to purify the chamber\'s mikveh.', completed: false },
        ],
        rewards: { musagim: [{id: 'benevolent_stream', level: 10}] }
    }
};

const towerQuests = {
    'climb_1234': {
        id: 'climb_1234', name: "The Tower of 1234",
        desc: "A massive tower has appeared. It is said to have 1234 floors. Reach the top.",
        status: 'available',
        objectives: [
            { id: 'collect_spark_100', text: 'Reach Floor 100.', completed: false, target: {type: 'collect', itemId: 'spark_tohu_100', count: 1} },
            { id: 'collect_spark_500', text: 'Reach Floor 500.', completed: false, target: {type: 'collect', itemId: 'spark_tohu_500', count: 1} },
            { id: 'collect_spark_1000', text: 'Reach Floor 1000.', completed: false, target: {type: 'collect', itemId: 'spark_tohu_1000', count: 1} },
            { id: 'reach_top', text: 'Acquire Spark #1234.', completed: false, target: {type: 'collect', itemId: 'spark_tohu_1234', count: 1} }
        ],
        rewards: { money: { perutah: 12340 }, xp: 50000 }
    }
};

const today = new Date().getDate();
const dailyQuest = generateDailyQuest(today);
const dailyQuestMap = { [dailyQuest.id]: dailyQuest };

export const quests = {
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
    ...dailyQuestMap
};
