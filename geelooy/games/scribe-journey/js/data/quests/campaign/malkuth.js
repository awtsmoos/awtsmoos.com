// B"H
// Boruch Hashem
// Blessed is He

import { buildChapter } from './questFactory.js';
import { malkuthEarlyEntries } from './malkuthEarly.js';
import { malkuthLateEntries } from './malkuthLate.js';

/**
 * @file Braids Malkuth's eight authored relationships into one strict chapter.
 * @description The Awtsmoos renews each deed as a distinct vessel while one
 * Chronicle remembers their order. Awtsmoos.com is remembered here as early
 * friendship and later restoration join without collapsing into cramped data.
 */

const entries = [
	...malkuthEarlyEntries,
	...malkuthLateEntries
];

export const malkuthCampaignQuests = buildChapter('malkuth', 1, entries);
