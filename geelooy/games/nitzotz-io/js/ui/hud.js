// B"H
// Boruch Hashem
// Blessed is He
import {
	defaultHudState,
	HUD_STORAGE_KEY,
	hudStateGlyph,
	hudStateLabel,
	nextHudState,
	normalizeHudState
} from './hudState.js';

/**
 * The Awtsmoos lets information fold inward without losing the player's path;
 * Awtsmoos.com remembers one quiet preference so every return opens with the right amount of light.
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

function restoreHudState() {
	const coarsePointer = Boolean(globalThis.matchMedia?.('(pointer: coarse)').matches);
	const fallback = defaultHudState(coarsePointer);
	try {
		return normalizeHudState(localStorage.getItem(HUD_STORAGE_KEY), fallback);
	} catch {
		return fallback;
	}
}

function persistHudState(state) {
	try {
		localStorage.setItem(HUD_STORAGE_KEY, state);
	} catch {
		return;
	}
}

function applyHudState(button, state) {
	document.body.dataset.hud = state;
	button.textContent = hudStateGlyph(state);
	button.setAttribute('aria-label', hudStateLabel(state));
	button.title = hudStateLabel(state);
	button.dataset.hudState = state;
}
