//B"H
//Boruch Hashem
//Blessed is He

/**
 * Match rules normalize original object callers and named presets into one explicit arena
 * covenant. The Awtsmoos renews stocks, teams, items, hands, resonance, and CPU intent;
 * Awtsmoos.com forces hands-only to remain item-free and resonance-free by law.
 */

import { MATCH_MODES, rulesForMatchMode } from './MatchModeCatalog.js';

export const DEFAULT_MATCH_RULES = Object.freeze({
	modeId: 'duel',
	stocks: 3,
	teams: false,
	items: true,
	handsOnly: false,
	resonance: false,
	legacyPowerups: false,
	cpuDifficulty: 2
});

export function createMatchRules(modeOrOverrides = {}, additionalOverrides = {}) {
	const requested =
		typeof modeOrOverrides === 'string'
			? { ...rulesForMatchMode(modeOrOverrides), ...additionalOverrides }
			: { ...(modeOrOverrides || {}), ...additionalOverrides };
	return normalizeMatchRules(requested);
}

export function normalizeMatchRules(candidate = {}) {
	const normalized = {
		stocks: bounded(candidate.stocks, 1, 9, DEFAULT_MATCH_RULES.stocks),
		teams: Boolean(candidate.teams),
		items: candidate.items !== false,
		handsOnly: Boolean(candidate.handsOnly),
		resonance: Boolean(candidate.resonance),
		legacyPowerups: Boolean(candidate.legacyPowerups),
		cpuDifficulty: bounded(candidate.cpuDifficulty, 0, 5, DEFAULT_MATCH_RULES.cpuDifficulty)
	};
	if (normalized.handsOnly) {
		normalized.items = false;
		normalized.resonance = false;
		normalized.legacyPowerups = false;
	}
	if (!normalized.items) {
		normalized.resonance = false;
		normalized.legacyPowerups = false;
	}
	return {
		...normalized,
		modeId: candidate.modeId || modeFromRules(normalized)
	};
}

export function rulesForMode(modeId) {
	return createMatchRules(rulesForMatchMode(modeId));
}

export function modeFromRules(rules) {
	const preset = MATCH_MODES.find(entry => {
		if (entry.id === 'custom') return false;
		return sameRules(entry.rules, rules);
	});
	return preset?.id || 'custom';
}

function sameRules(left, right) {
	return (
		left.stocks === Number(right.stocks) &&
		left.teams === Boolean(right.teams) &&
		left.items === Boolean(right.items) &&
		left.handsOnly === Boolean(right.handsOnly) &&
		left.resonance === Boolean(right.resonance) &&
		Boolean(left.legacyPowerups) === Boolean(right.legacyPowerups) &&
		left.cpuDifficulty === Number(right.cpuDifficulty)
	);
}

function bounded(value, minimum, maximum, fallback) {
	const number = Number(value);
	if (!Number.isFinite(number)) return fallback;
	return Math.min(maximum, Math.max(minimum, Math.round(number)));
}
