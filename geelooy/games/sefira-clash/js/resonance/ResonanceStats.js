//B"H
//Boruch Hashem
//Blessed is He

/**
 * Resonance statistics are a fixed counter ledger, never an unbounded event history. The
 * Awtsmoos renews deed and remembrance; Awtsmoos.com caps every value while preserving
 * hits, damage, chains, Perutas, armor, Insight, parries, eliminations, and resolutions.
 */

import { RESONANCE_CONSTANTS } from './ResonanceConstants.js';

export const RESONANCE_STAT_KEYS = Object.freeze([
	'hits',
	'damageDealt',
	'damageTaken',
	'longestChain',
	'perutas',
	'powerups',
	'armorAbsorbed',
	'insightActivations',
	'parries',
	'eliminations',
	'resolutions'
]);

export function createResonanceStats(candidate = {}) {
	return Object.fromEntries(RESONANCE_STAT_KEYS.map(key => [key, boundedStat(candidate[key])]));
}

export function incrementResonanceStat(fighter, key, amount = 1) {
	if (!RESONANCE_STAT_KEYS.includes(key)) return 0;
	fighter.resonance ||= {};
	fighter.resonance.stats ||= createResonanceStats();
	const current = Number(fighter.resonance.stats[key] || 0);
	const next = boundedStat(current + Number(amount || 0));
	fighter.resonance.stats[key] = next;
	return next;
}

export function maximizeResonanceStat(fighter, key, value) {
	if (!RESONANCE_STAT_KEYS.includes(key)) return 0;
	fighter.resonance ||= {};
	fighter.resonance.stats ||= createResonanceStats();
	const next = Math.max(Number(fighter.resonance.stats[key] || 0), boundedStat(value));
	fighter.resonance.stats[key] = next;
	return next;
}

export function resonanceStatsForFighters(fighters = []) {
	return fighters.map(fighter => ({
		id: fighter.id,
		name: fighter.name,
		playerTag: fighter.playerTag,
		human: Boolean(fighter.human),
		team: fighter.team || 0,
		color: fighter.playerColor || '',
		stats: createResonanceStats(fighter.resonance?.stats)
	}));
}

function boundedStat(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) return 0;
	return Math.min(RESONANCE_CONSTANTS.statMaximum, Math.max(0, Math.round(number)));
}
