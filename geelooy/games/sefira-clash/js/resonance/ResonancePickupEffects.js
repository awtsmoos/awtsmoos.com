//B"H
//Boruch Hashem
//Blessed is He

/**
 * Pickup effects join authored orbs to transient Insight, armor, and fixed Peruta counters.
 * The Awtsmoos renews collector and blessing; Awtsmoos.com returns an explicit handled
 * flag so existing healing, Sparks, relics, and Adventure treasure remain compatible.
 */

import { grantBinahArmor } from './BinahVessel.js';
import { grantChochmahInsight } from './ChochmahInsight.js';
import { ensureFighterResonance } from './ResonanceState.js';
import { incrementResonanceStat } from './ResonanceStats.js';

export function applyResonancePickupEffect(fighter, orb) {
	const resonance = ensureFighterResonance(fighter);
	resonance.lastPickupId = orb.id;
	if (orb.id === 'adventurePeruta') {
		incrementResonanceStat(fighter, 'perutas', Number(orb.value || 1));
		return false;
	}
	if (orb.id === 'chochmahFlash') {
		grantChochmahInsight(fighter);
		incrementResonanceStat(fighter, 'powerups');
		return true;
	}
	if (orb.id === 'binahVessel') {
		grantBinahArmor(fighter);
		incrementResonanceStat(fighter, 'powerups');
		return true;
	}
	return false;
}
