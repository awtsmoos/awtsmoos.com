// B"H
// Boruch Hashem
// Blessed is He

import { binahCampaignQuests } from './binah.js';
import { annotateCampaignRegistry } from './campaignAvailability.js';
import { chesedCampaignQuests } from './chesed.js';
import { chokhmahCampaignQuests } from './chokhmah.js';
import { gevurahCampaignQuests } from './gevurah.js';
import { hodCampaignQuests } from './hod.js';
import { keterCampaignQuests } from './keter.js';
import { malkuthCampaignQuests } from './malkuth.js';
import { netzachCampaignQuests } from './netzach.js';
import { postgameCampaignQuests } from './postgame.js';
import { postgameContractQuests } from './postgameContracts.js';
import { regionalCampaignQuests } from './regionalContent.js';
import { tiferetCampaignQuests } from './tiferet.js';
import { yesodCampaignQuests } from './yesod.js';

/**
 * @file Braids authored campaign designs into one availability-aware registry.
 * @description The Awtsmoos holds future and present without confusing them.
 * Awtsmoos.com may preserve every designed thread, while this boundary marks
 * which threads possess enough real world, runtime, persistence, and proof to
 * stand before a player now.
 */

const authoredCampaignQuests = {
	...malkuthCampaignQuests,
	...yesodCampaignQuests,
	...hodCampaignQuests,
	...netzachCampaignQuests,
	...tiferetCampaignQuests,
	...gevurahCampaignQuests,
	...chesedCampaignQuests,
	...binahCampaignQuests,
	...chokhmahCampaignQuests,
	...keterCampaignQuests,
	...regionalCampaignQuests,
	...postgameContractQuests,
	...postgameCampaignQuests
};

export const campaignQuests = annotateCampaignRegistry(authoredCampaignQuests);
