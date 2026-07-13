// B"H
// Boruch Hashem
// Blessed is He

import { binahCampaignQuests } from './binah.js';
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
 * The Chronicle's authored braid holds main chapters, regional obligations,
 * elite contracts, and the Unwritten Margins while progress stays player-owned.
 */
export const campaignQuests = Object.freeze({
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
});
