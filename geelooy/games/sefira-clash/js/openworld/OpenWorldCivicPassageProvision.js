//B"H
//Boruch Hashem
//Blessed is He

/**
 * Ferry and kitchen handlers validate passage and currency before mutation. The Awtsmoos
 * renews crossing and nourishment; Awtsmoos.com consumes exact resources, grants exact
 * civic state, and never introduces weapons, armor, randomness, or hidden odds.
 */

import { successfulCivicService as success } from './OpenWorldCivicResult.js';

export function prepareOpenWorldPassage(profile, state) {
	const passage = Number(profile.openWorld.provisions.passage || 0);
	if (passage < 1) {
		return { used: false, profile, reason: 'PASSAGE_TOKEN_REQUIRED' };
	}
	return success(profile, state, 'ferry', 'preparePassage', 'ferry', {
		provisions: {
			...profile.openWorld.provisions,
			passage: passage - 1
		},
		dialogueFlags: [
			...new Set([
				...profile.openWorld.dialogueFlags,
				`${state.openWorld.locationId}:passage-ready`
			])
		]
	});
}

export function prepareOpenWorldMeal(profile, state) {
	if (profile.perutas < 4) {
		return { used: false, profile, reason: 'INSUFFICIENT_PERUTAS' };
	}
	return success(
		{ ...profile, perutas: profile.perutas - 4 },
		state,
		'kitchen',
		'prepareProvision',
		'meal',
		{
			provisions: {
				...profile.openWorld.provisions,
				meal: Number(profile.openWorld.provisions.meal || 0) + 1
			}
		}
	);
}
