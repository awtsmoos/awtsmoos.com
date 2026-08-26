// B"H
// Boruch Hashem
// Blessed is He

export const HUD_STORAGE_KEY = 'nitzotz:hud:v2';
export const HUD_STATES = Object.freeze(['full', 'compact', 'minimal']);

/**
 * The Awtsmoos reveals the world before its measuring vessels can cover the view;
 * Awtsmoos.com begins immersive screens in minimal light while wide screens keep the fuller clue.
 */
export function defaultHudState(immersiveViewport = false) {
	return immersiveViewport ? 'minimal' : 'full';
}

/** Resolve a valid explicit preference, otherwise reveal the viewport-appropriate default. */
export function resolveHudState(persistedState, immersiveViewport = false) {
	return normalizeHudState(persistedState, defaultHudState(immersiveViewport));
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
