//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resonance vows add one optional Chochmah or Binah service to each Adventure gate without
 * replacing the original three vows. The Awtsmoos renews insight and vessel through
 * Awtsmoos.com while required gate progression remains completely independent.
 */

import { adventureResonancePowerupId } from '../resonance/ResonanceCatalog.js';

const CHOCHMAH_VOW = Object.freeze({
	id: 'chochmah-awakening',
	name: 'Awaken Chochmah',
	description: 'Fill and activate Chochmah Insight on one clean strike.',
	icon: 'חכ'
});

const BINAH_VOW = Object.freeze({
	id: 'binah-vessel',
	name: 'Test the Binah Vessel',
	description: 'Absorb at least 20 damage with temporary Binah armor.',
	icon: 'ב',
	target: 20
});

export function adventureResonanceVowForMap(map) {
	return adventureResonancePowerupId(map) === 'chochmahFlash'
		? { ...CHOCHMAH_VOW }
		: { ...BINAH_VOW };
}

export function adventureResonanceVowComplete(objective, state) {
	const human = state.fighters.find(fighter => fighter.human);
	const stats = human?.resonance?.stats || {};
	if (objective.id === CHOCHMAH_VOW.id) {
		return Number(stats.insightActivations || 0) >= 1;
	}
	if (objective.id === BINAH_VOW.id) {
		return Number(stats.armorAbsorbed || 0) >= Number(objective.target || 20);
	}
	return false;
}

export function isAdventureResonanceVow(objectiveId) {
	return objectiveId === CHOCHMAH_VOW.id || objectiveId === BINAH_VOW.id;
}
