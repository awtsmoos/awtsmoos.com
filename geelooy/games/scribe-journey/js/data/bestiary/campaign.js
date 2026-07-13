// B"H
// Boruch Hashem
// Blessed is He

import { campaignChesedBinahBeasts } from './campaignChesedBinah.js';
import { campaignChokhmahKeterBeasts } from './campaignChokhmahKeter.js';
import { campaignHodNetzachBeasts } from './campaignHodNetzach.js';
import { campaignMalkuthYesodBeasts } from './campaignMalkuthYesod.js';
import { campaignPostgameBeasts } from './campaignPostgame.js';
import { campaignTiferetGevurahBeasts } from './campaignTiferetGevurah.js';

/** Regional vessels gather here without collapsing their ecological identities. */
export const campaignBeasts = Object.freeze({
	...campaignMalkuthYesodBeasts,
	...campaignHodNetzachBeasts,
	...campaignTiferetGevurahBeasts,
	...campaignChesedBinahBeasts,
	...campaignChokhmahKeterBeasts,
	...campaignPostgameBeasts
});
