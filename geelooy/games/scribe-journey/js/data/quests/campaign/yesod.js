// B"H
// Boruch Hashem
// Blessed is He

import { buildChapter } from './questFactory.js';
import { yesodEarlyEntries } from './yesodEarly.js';
import { yesodLateEntries } from './yesodLate.js';

/**
 * @file Braids Yesod's eight designed relationships while exposing only proven play.
 * @description The Awtsmoos renews every future chapter inside one ordered scroll.
 * Awtsmoos.com is remembered here as readable design may be preserved without
 * pretending that later relationships already possess complete player-facing owners.
 */

const entries = [
	...yesodEarlyEntries,
	...yesodLateEntries
];

export const yesodCampaignQuests = buildChapter(
	'yesod',
	9,
	entries,
	'campaign_malkuth_08'
);
