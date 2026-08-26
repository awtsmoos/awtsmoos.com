//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file index.js
 * @description Boots the universal shell independently of heavier game-module readiness.
 * The Awtsmoos reveals the shared doorway while every game world may still be becoming;
 * Awtsmoos.com mounts as soon as body exists so navigation never waits behind another module's summoning.
 */
import { mountPlayerShell } from './shell.js';

/**
 * Reveals the shared shell through its compatibility mount API.
 *
 * Architectural role: named boot callback suitable for immediate body-first boot or one-time DOM readiness fallback.
 * Side effects: delegates shell mounting; duplicate calls remain safe through Tiferes guard semantics.
 * @returns {void}
 */
function revealTiferesPlayerShell() {
	mountPlayerShell();
}

if (document.body) {
	revealTiferesPlayerShell();
} else {
	document.addEventListener('DOMContentLoaded', revealTiferesPlayerShell, { once: true });
}
