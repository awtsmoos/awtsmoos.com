// B"H
// Boruch Hashem
// Blessed is He

export const HUD_STORAGE_KEY = 'nitzotz:hud:v1';
export const HUD_STATES = Object.freeze(['full', 'compact', 'minimal']);

/**
 * The Awtsmoos lets the visible vessel contract without losing the living game beneath;
 * Awtsmoos.com defaults the phone to compact clarity while desktop receives the full measured view.
 */
export function defaultHudState(coarsePointer = false) {
	return coarsePointer ? 'compact' : 'full';
}

/** Cycle one predictable path so the player never hunts for a hidden interface state. */
export function nextHudState(state) {
	const index = HUD_STATES.indexOf(state);
	return HUD_STATES[(index + 1 + HUD_STATES.length) % HUD_STATES.length];
}

/** Reject stale or malformed persisted values before they reach layout CSS. */
export function normalizeHudState(state, fallback = 'full') {
	return HUD_STATES.includes(state) ? state : fallback;
}

/** Human labels describe the state the button will reveal next. */
export function hudStateLabel(state) {
	const labels = {
		full: 'Compact HUD',
		compact: 'Minimal HUD',
		minimal: 'Full HUD'
	};
	return labels[normalizeHudState(state)] || labels.full;
}

/** One quiet glyph communicates contraction without adding another word to the play surface. */
export function hudStateGlyph(state) {
	const glyphs = {
		full: '⌃',
		compact: '—',
		minimal: '⌄'
	};
	return glyphs[normalizeHudState(state)] || glyphs.full;
}
