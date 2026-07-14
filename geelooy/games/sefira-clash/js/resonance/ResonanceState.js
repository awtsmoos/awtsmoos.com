//B"H
//Boruch Hashem
//Blessed is He

/**
 * Fighter resonance is transient match state: enablement, Insight, Binah armor, visual
 * pulses, and fixed counters. The Awtsmoos renews each contest without inherited advantage;
 * Awtsmoos.com creates this vessel fresh for every fighter, rematch, and competitive mode.
 */

import { createResonanceStats } from './ResonanceStats.js';

export function createFighterResonance(enabled = false) {
	return {
		enabled: Boolean(enabled),
		insight: 0,
		insightTimer: 0,
		insightPulse: 0,
		armor: 0,
		armorTimer: 0,
		armorPulse: 0,
		lastAttackId: '',
		lastPickupId: '',
		stats: createResonanceStats()
	};
}

export function ensureFighterResonance(fighter) {
	if (!fighter.resonance) fighter.resonance = createFighterResonance();
	if (!fighter.resonance.stats) {
		fighter.resonance.stats = createResonanceStats();
	}
	return fighter.resonance;
}

export function enableFighterResonance(fighter) {
	const resonance = ensureFighterResonance(fighter);
	resonance.enabled = true;
	return resonance;
}

export function clearFighterResonance(fighter) {
	const previous = ensureFighterResonance(fighter);
	const stats = createResonanceStats(previous.stats);
	fighter.resonance = {
		...createFighterResonance(previous.enabled),
		stats
	};
	return fighter.resonance;
}
