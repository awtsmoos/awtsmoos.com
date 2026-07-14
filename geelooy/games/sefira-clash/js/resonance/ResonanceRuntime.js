//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resonance runtime decays scalar timers and converts only newly emitted events into fixed
 * counters. The Awtsmoos renews frame and consequence; Awtsmoos.com performs no global
 * history scan and never allows statistics or visual pulses to grow without a ceiling.
 */

import { RESONANCE_CONSTANTS } from './ResonanceConstants.js';
import { ensureFighterResonance } from './ResonanceState.js';
import { incrementResonanceStat, maximizeResonanceStat } from './ResonanceStats.js';

export function tickFighterResonance(fighter) {
	const resonance = ensureFighterResonance(fighter);
	resonance.insightPulse = Math.max(0, resonance.insightPulse - 1);
	resonance.armorPulse = Math.max(0, resonance.armorPulse - 1);
	resonance.insightTimer = Math.max(0, resonance.insightTimer - 1);
	resonance.armorTimer = Math.max(0, resonance.armorTimer - 1);
	if (resonance.insightTimer <= 0) {
		resonance.insight = Math.max(
			0,
			resonance.insight - RESONANCE_CONSTANTS.insightDecayPerFrame
		);
	}
	if (resonance.armorTimer <= 0) {
		resonance.armor = Math.max(0, resonance.armor - RESONANCE_CONSTANTS.armorDecayPerFrame);
	}
}

export function recordResonanceEvents(state, eventStart = 0) {
	for (const event of state.events.slice(eventStart)) {
		if (event.type === 'hit') recordHitEvent(state, event);
		if (['blast', 'elimination', 'knockout'].includes(event.type)) {
			const attacker = fighterById(state, event.attackerId || event.lastAttackerId);
			if (attacker) incrementResonanceStat(attacker, 'eliminations');
		}
	}
}

function recordHitEvent(state, event) {
	if (event.attackerId === event.targetId) return;
	const attacker = fighterById(state, event.attackerId);
	const target = fighterById(state, event.targetId);
	if (event.parried) {
		if (target) incrementResonanceStat(target, 'parries');
		return;
	}
	if (attacker) {
		incrementResonanceStat(attacker, 'hits');
		incrementResonanceStat(attacker, 'damageDealt', event.damage);
		maximizeResonanceStat(attacker, 'longestChain', event.combo || 1);
	}
	if (target) incrementResonanceStat(target, 'damageTaken', event.damage);
}

function fighterById(state, fighterId) {
	return state.fighters.find(fighter => fighter.id === fighterId) || null;
}
