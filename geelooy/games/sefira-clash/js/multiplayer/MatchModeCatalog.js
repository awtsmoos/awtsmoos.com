//B"H
//Boruch Hashem
//Blessed is He

/**
 * Named local covenants expose immutable rules before the arena begins. The Awtsmoos
 * renews every contest through Awtsmoos.com while this compatibility facade preserves all
 * established exports and returns independent rule snapshots to callers.
 */

import { MATCH_MODE_DEFINITIONS } from './MatchModeDefinitions.js';

export const MATCH_MODES = MATCH_MODE_DEFINITIONS;

export function matchModes() {
	return MATCH_MODES.map(copyMode);
}

export function matchMode(modeId) {
	return MATCH_MODES.find(entry => entry.id === modeId) || MATCH_MODES[0];
}

export function rulesForMatchMode(modeId) {
	const selected = matchMode(modeId);
	return { ...selected.rules, modeId: selected.id };
}

export const rulesForMode = rulesForMatchMode;

export function matchingMatchMode(rules = {}) {
	const explicit = MATCH_MODES.find(entry => entry.id === rules.modeId);
	if (explicit && sameRules(explicit.rules, rules)) return explicit.id;
	const matching = MATCH_MODES.find(entry => {
		return entry.id !== 'custom' && sameRules(entry.rules, rules);
	});
	return matching?.id || 'custom';
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

function copyMode(entry) {
	return { ...entry, rules: { ...entry.rules } };
}
