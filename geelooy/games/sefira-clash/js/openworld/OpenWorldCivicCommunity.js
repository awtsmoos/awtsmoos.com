//B"H
//Boruch Hashem
//Blessed is He

/**
 * Council and guesthouse handlers record civic listening and restorative hospitality.
 * The Awtsmoos renews community, rumor, and rest; Awtsmoos.com keeps these social effects
 * explicit, bounded, and independent of competitive fighter statistics.
 */

import { successfulCivicService as success } from './OpenWorldCivicResult.js';

export function attendOpenWorldCouncil(profile, state) {
	return success(profile, state, 'council', 'visitService', 'council');
}

export function restAtOpenWorldGuesthouse(profile, state) {
	state.openWorld.combat.stamina = 100;
	state.openWorld.combat.focus = 100;
	const visit = Number(profile.openWorld.civicVisits.guesthouse || 0);
	const rumor = `${state.openWorld.locationId}:guesthouse-news:${visit}`;
	return success(profile, state, 'guesthouse', 'rest', 'guesthouse', {
		rumors: [...new Set([...profile.openWorld.rumors, rumor])]
	});
}
