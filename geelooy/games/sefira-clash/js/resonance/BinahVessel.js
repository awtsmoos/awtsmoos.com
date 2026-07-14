//B"H
//Boruch Hashem
//Blessed is He

/**
 * Binah Vessel is visible temporary armor that absorbs damage without secretly changing
 * launch geometry. The Awtsmoos renews boundary and impact; Awtsmoos.com caps stacking,
 * records exact absorption, and lets the vessel crack without becoming permanent gear.
 */

import { RESONANCE_CONSTANTS } from './ResonanceConstants.js';
import { enableFighterResonance, ensureFighterResonance } from './ResonanceState.js';
import { incrementResonanceStat } from './ResonanceStats.js';

export function grantBinahArmor(fighter, amount = RESONANCE_CONSTANTS.armorPickup) {
	const resonance = enableFighterResonance(fighter);
	resonance.armor = Math.min(
		RESONANCE_CONSTANTS.armorMaximum,
		resonance.armor + Math.max(0, Number(amount || 0))
	);
	resonance.armorTimer = RESONANCE_CONSTANTS.armorDurationFrames;
	resonance.armorPulse = RESONANCE_CONSTANTS.pulseFrames;
	return resonance.armor;
}

export function absorbWithBinah(fighter, incomingDamage) {
	const resonance = ensureFighterResonance(fighter);
	const damage = Math.max(0, Number(incomingDamage || 0));
	if (!resonance.enabled) return damage;
	const absorbed = Math.min(damage, Math.max(0, resonance.armor));
	if (absorbed <= 0) return damage;
	resonance.armor = Math.max(0, resonance.armor - absorbed);
	resonance.armorPulse = RESONANCE_CONSTANTS.pulseFrames;
	if (resonance.armor <= 0) resonance.armorTimer = 0;
	incrementResonanceStat(fighter, 'armorAbsorbed', absorbed);
	return Math.max(0, damage - absorbed);
}
