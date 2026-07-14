//B"H
//Boruch Hashem
//Blessed is He

/**
 * Archive and clinic handlers reveal knowledge and restore the traveler through bounded
 * effects. The Awtsmoos renews clue, body, and care; Awtsmoos.com emits mission evidence
 * while refusing hidden combat bonuses or unbounded recovery state.
 */

import { successfulCivicService as success } from './OpenWorldCivicResult.js';

export function inspectOpenWorldArchive(profile, state) {
	const visit = Number(profile.openWorld.civicVisits.archive || 0);
	const clue = `${state.openWorld.locationId}:archive:${visit}`;
	return success(profile, state, 'archive', 'investigate', 'archive', {
		dialogueFlags: [...new Set([...profile.openWorld.dialogueFlags, clue])],
		rumors: [
			...new Set([
				...profile.openWorld.rumors,
				`${state.openWorld.locationName}: archive clue ${visit}`
			])
		]
	});
}

export function receiveOpenWorldClinicCare(profile, state) {
	state.openWorld.combat.stamina = 100;
	state.openWorld.combat.focus = 100;
	state.openWorld.combat.posture = 100;
	const human = state.fighters.find(fighter => fighter.human);
	if (human) human.damage = Math.max(0, Number(human.damage || 0) - 40);
	return success(profile, state, 'clinic', 'visitService', 'clinic');
}
