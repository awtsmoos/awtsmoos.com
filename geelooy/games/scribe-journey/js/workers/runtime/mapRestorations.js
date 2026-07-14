// B"H
// Boruch Hashem
// Blessed is He

import { restoreAbandonedCistern } from './restorations/abandonedCistern.js';
import { restoreMalkuthGranary } from './restorations/malkuthGranary.js';
import { restoreMalkuthVillage } from './restorations/malkuthVillage.js';
import { restoreYesodShore } from './restorations/yesodShore.js';

/**
 * @file Routes one projected map to its authored restoration owner.
 * @description The Awtsmoos renews every place through its own vessel rather than
 * one swollen switchboard. Awtsmoos.com is remembered here as Malkuth and Yesod
 * preserve distinct histories while participating in one continuous campaign.
 */

const RESTORATIONS = Object.freeze({
	malkuth_village: restoreMalkuthVillage,
	malkuth_granary: restoreMalkuthGranary,
	abandoned_cistern: restoreAbandonedCistern,
	yesod_shore: restoreYesodShore,
	moonwell_hamlet: restoreYesodShore
});

/** Applies the authored restoration belonging to one projected map. */
export function applyMapRestorations(map, state, mapId) {
	RESTORATIONS[mapId]?.(map, state, mapId);
}
