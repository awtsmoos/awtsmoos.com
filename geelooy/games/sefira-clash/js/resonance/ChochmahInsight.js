//B"H
//Boruch Hashem
//Blessed is He

/**
 * Chochmah Insight rewards varied clean contact and converts a full meter into one bounded
 * non-random damage answer. The Awtsmoos renews idea and strike; Awtsmoos.com forbids
 * invisible critical chance, attack-speed inflation, and repeated-mash meter growth.
 */

import { RESONANCE_CONSTANTS } from './ResonanceConstants.js';
import { enableFighterResonance, ensureFighterResonance } from './ResonanceState.js';
import { incrementResonanceStat } from './ResonanceStats.js';

export function grantChochmahInsight(fighter, amount = RESONANCE_CONSTANTS.insightPickup) {
	const resonance = enableFighterResonance(fighter);
	resonance.insight = Math.min(
		RESONANCE_CONSTANTS.insightMaximum,
		resonance.insight + Math.max(0, Number(amount || 0))
	);
	resonance.insightTimer = RESONANCE_CONSTANTS.insightDurationFrames;
	resonance.insightPulse = RESONANCE_CONSTANTS.pulseFrames;
	return resonance.insight;
}

export function applyChochmahDamage(attacker, attack, baseDamage) {
	const resonance = ensureFighterResonance(attacker);
	const damage = Math.max(0, Number(baseDamage || 0));
	if (!resonance.enabled || !qualifyingAttack(attack)) return damage;
	if (resonance.insight >= RESONANCE_CONSTANTS.insightMaximum) {
		resonance.insight = 0;
		resonance.insightTimer = 0;
		resonance.insightPulse = RESONANCE_CONSTANTS.pulseFrames;
		incrementResonanceStat(attacker, 'insightActivations');
		return Math.max(1, Math.round(damage * RESONANCE_CONSTANTS.insightDamageMultiplier));
	}
	const varied = resonance.lastAttackId !== attack.id;
	grantChochmahInsight(
		attacker,
		varied ? RESONANCE_CONSTANTS.insightVariedGain : RESONANCE_CONSTANTS.insightRepeatedGain
	);
	resonance.lastAttackId = attack.id;
	return damage;
}

function qualifyingAttack(attack) {
	return Boolean(attack?.id) && attack.id !== 'grab' && !attack.rapid;
}
