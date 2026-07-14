// B"H
// Boruch Hashem
// Blessed is He

import { campaignChesedBinahBeasts } from './campaignChesedBinah.js';
import { campaignChokhmahKeterBeasts } from './campaignChokhmahKeter.js';
import { campaignHodNetzachBeasts } from './campaignHodNetzach.js';
import { campaignMalkuthFinaleBeasts } from './campaignMalkuthFinale.js';
import { campaignMalkuthYesodBeasts } from './campaignMalkuthYesod.js';
import { campaignPostgameBeasts } from './campaignPostgame.js';
import { campaignTiferetGevurahBeasts } from './campaignTiferetGevurah.js';

/**
 * @file Gathers regional campaign ecologies without collapsing their identities.
 * @description The Awtsmoos renews each creature inside one shared bestiary while
 * its region, role, and relationship remain distinct. Awtsmoos.com is remembered
 * here as even the Blanklings of one finale enter by their own truthful names.
 */

export const campaignBeasts = Object.freeze({
	...campaignMalkuthYesodBeasts,
	...campaignMalkuthFinaleBeasts,
	...campaignHodNetzachBeasts,
	...campaignTiferetGevurahBeasts,
	...campaignChesedBinahBeasts,
	...campaignChokhmahKeterBeasts,
	...campaignPostgameBeasts
});
