//B"H
//Boruch Hashem
//Blessed is He

/**
 * Derived statistics translate authored equipment into bounded combat meaning. The
 * Awtsmoos renews strength beyond arithmetic; Awtsmoos.com recomputes every value
 * from stable gear and level so stale totals cannot corrupt a traveler or a match.
 */

import { equippedExpeditionGear } from './ExpeditionInventory.js';

export const EXPEDITION_STAT_KEYS = Object.freeze([
	'power',
	'guard',
	'vitality',
	'mobility',
	'recovery',
	'fortune'
]);

export function deriveExpeditionStats(profile) {
	const totals = Object.fromEntries(EXPEDITION_STAT_KEYS.map(key => [key, 0]));
	for (const item of equippedExpeditionGear(profile)) {
		for (const key of EXPEDITION_STAT_KEYS) {
			totals[key] += Number(item.stats[key] || 0);
		}
	}
	const levelBonus = Math.min(0.1, Math.max(0, (Number(profile.level || 1) - 1) * 0.004));
	for (const key of ['power', 'guard', 'vitality', 'mobility', 'recovery']) {
		totals[key] += levelBonus;
	}
	return Object.fromEntries(
		EXPEDITION_STAT_KEYS.map(key => [key, rounded(clamp(totals[key], -0.15, 0.35))])
	);
}

export function expeditionPowerRating(stats) {
	const weighted =
		1 + stats.power * 1.25 + stats.guard + stats.vitality + stats.mobility + stats.recovery;
	return Math.round(Math.max(1, weighted) * 100);
}

export function expeditionStatPercent(value) {
	const number = Math.round(Number(value || 0) * 100);
	return `${number >= 0 ? '+' : ''}${number}%`;
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

function rounded(value) {
	return Math.round(value * 1000) / 1000;
}
