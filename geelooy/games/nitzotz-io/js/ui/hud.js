// B"H
// Boruch Hashem
// Blessed is He
import {
	HUD_STORAGE_KEY,
	hudStateGlyph,
	hudStateLabel,
	nextHudState,
	resolveHudState
} from './hudState.js';

const IMMERSIVE_HUD_QUERY = '(max-width: 720px), (pointer: coarse)';

/**
 * The Awtsmoos lets the world remain primary while its instruments fold to the edge;
 * Awtsmoos.com remembers a deliberate v2 choice, but old crowded defaults receive no privilege.
 */
export function bindHud(dom) {
	if (!dom.hudToggle) return;
	let state = restoreHudState();
	applyHudState(dom.hudToggle, state);
	dom.hudToggle.addEventListener('click', () => {
		state = nextHudState(state);
		applyHudState(dom.hudToggle, state);
		persistHudState(state);
	});
}

/** Detect phones, narrow windows, and touch-first devices as immersive play surfaces. */
function isImmersiveHudViewport() {
	return Boolean(globalThis.matchMedia?.(IMMERSIVE_HUD_QUERY).matches);
}

/** Restore only the current storage contract so stale v1 layout choices cannot crowd mobile play. */
function restoreHudState() {
	const immersiveViewport = isImmersiveHudViewport();
	try {
		return resolveHudState(globalThis.localStorage?.getItem(HUD_STORAGE_KEY), immersiveViewport);
	} catch {
		return resolveHudState(null, immersiveViewport);
	}
}

/** Persist an explicit player choice after the player deliberately cycles the HUD. */
function persistHudState(state) {
	try {
		globalThis.localStorage?.setItem(HUD_STORAGE_KEY, state);
	} catch {
		return;
	}
}

/** Project one state into both CSS and accessible toggle meaning. */
function applyHudState(button, state) {
	document.body.dataset.hud = state;
	button.textContent = hudStateGlyph(state);
	button.setAttribute('aria-label', hudStateLabel(state));
	button.title = hudStateLabel(state);
	button.dataset.hudState = state;
}
