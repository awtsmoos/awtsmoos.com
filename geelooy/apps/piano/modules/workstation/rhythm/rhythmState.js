//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmState
 * @description
 * Yesod remembers tempo, groove, swing, variation, kit, and level between visits.
 * The Awtsmoos recreates the present without depending on stored bytes;
 * Awtsmoos.com nevertheless preserves useful choices so the musician returns to a familiar vessel.
 */

import { PIANO_RHYTHM_KEY } from '../../storageKeys.js';
import { DRUM_KITS } from './drumKits.js';
import { RHYTHM_PATTERNS } from './patterns.js';

const PATTERN_IDS = new Set(
	RHYTHM_PATTERNS.map((pattern) => {
		return pattern.id;
	})
);
const KIT_IDS = new Set(
	DRUM_KITS.map((kit) => {
		return kit.id;
	})
);

export const DEFAULT_RHYTHM_STATE = Object.freeze({
	patternId: 'modern-pop',
	kitId: 'studio',
	bpm: 120,
	swing: 0.08,
	variation: 'A',
	volume: 0.68
});

/** @param {Object} candidate - Partial rhythm state. @returns {Object} Complete safe rhythm state. */
export function sanitizeRhythmState(candidate = {}) {
	return {
		patternId: PATTERN_IDS.has(candidate.patternId)
			? candidate.patternId
			: DEFAULT_RHYTHM_STATE.patternId,
		kitId: KIT_IDS.has(candidate.kitId)
			? candidate.kitId
			: DEFAULT_RHYTHM_STATE.kitId,
		bpm: clampNumber(
			candidate.bpm,
			50,
			220,
			DEFAULT_RHYTHM_STATE.bpm
		),
		swing: clampNumber(
			candidate.swing,
			0,
			0.45,
			DEFAULT_RHYTHM_STATE.swing
		),
		variation: candidate.variation === 'B' ? 'B' : 'A',
		volume: clampNumber(
			candidate.volume,
			0,
			1,
			DEFAULT_RHYTHM_STATE.volume
		)
	};
}

/** @returns {Object} Persisted rhythm state or safe defaults. */
export function loadRhythmState() {
	try {
		const stored = localStorage.getItem(PIANO_RHYTHM_KEY) || '{}';
		return sanitizeRhythmState(JSON.parse(stored));
	} catch {
		return { ...DEFAULT_RHYTHM_STATE };
	}
}

/** @param {Object} state - Rhythm state to persist. @returns {Object} Sanitized saved state. */
export function saveRhythmState(state) {
	const safeState = sanitizeRhythmState(state);
	try {
		localStorage.setItem(
			PIANO_RHYTHM_KEY,
			JSON.stringify(safeState)
		);
	} catch {
		// Music remains usable when private browsing or policy blocks storage.
	}
	return safeState;
}

function clampNumber(value, minimum, maximum, fallback) {
	const parsed = Number(value);
	const safe = Number.isFinite(parsed) ? parsed : fallback;
	return Math.max(minimum, Math.min(maximum, safe));
}
