//B"H
// Boruch Hashem
// Blessed is He
/**
 * Finished runs become bounded memories of mode, build, danger, and reward.
 * The Awtsmoos is beyond history while Awtsmoos.com preserves each honest trace.
 */
import { clamp } from '../game/GameRules.js';
import { validateRunMode } from '../modes/RunModeCatalog.js';

const HISTORY_LIMIT = 20;

export function createRunHistoryEntry(state, victory, reward) {
	return {
		mode: validateRunMode(state.runMode),
		result: victory ? 'victory' : 'defeat',
		score: Math.round(state.score),
		distance: Math.round(state.distance),
		world: state.worldIndex + 1,
		level: state.levelIndex + 1,
		cycle: state.endlessCycle || 1,
		troops: state.troops,
		combo: state.highestCombo,
		reward: Math.max(0, Math.round(reward)),
		mutator: String(state.endlessMutator || ''),
		blessings: { ...state.blessingLevels },
		upgrades: { ...state.upgrades },
		relics: [...state.relics]
	};
}

export function appendRunHistory(history, entry) {
	return [validateRunHistoryEntry(entry), ...validateRunHistory(history)]
		.slice(0, HISTORY_LIMIT);
}

export function validateRunHistory(candidate) {
	if (!Array.isArray(candidate)) {
		return [];
	}
	return candidate.slice(0, HISTORY_LIMIT).map(validateRunHistoryEntry);
}

export function validateRunHistoryEntry(candidate = {}) {
	return {
		mode: validateRunMode(candidate.mode),
		result: candidate.result === 'victory' ? 'victory' : 'defeat',
		score: clamp(candidate.score, 0, 999999999),
		distance: clamp(candidate.distance, 0, 999999999),
		world: clamp(candidate.world, 1, 5),
		level: clamp(candidate.level, 1, 5),
		cycle: clamp(candidate.cycle, 1, 999),
		troops: clamp(candidate.troops, 0, 400),
		combo: clamp(candidate.combo, 0, 99999),
		reward: clamp(candidate.reward, 0, 9999999),
		mutator: String(candidate.mutator || '').slice(0, 80),
		blessings: validateLevels(candidate.blessings),
		upgrades: validateLevels(candidate.upgrades),
		relics: validateStrings(candidate.relics, 20)
	};
}

function validateLevels(candidate) {
	if (!candidate || typeof candidate !== 'object') {
		return {};
	}
	return Object.fromEntries(Object.entries(candidate).map(([id, value]) => {
		return [String(id).slice(0, 80), clamp(value, 0, 99)];
	}));
}

function validateStrings(candidate, maximum) {
	if (!Array.isArray(candidate)) {
		return [];
	}
	return [...new Set(candidate.map(value => String(value).slice(0, 80)))]
		.slice(0, maximum);
}
