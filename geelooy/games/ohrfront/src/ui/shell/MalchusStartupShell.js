// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusStartupShell.js
 * @description Manifests the tiny startup and native-world mount surfaces before any runtime authority resolves DOM identifiers.
 * The Awtsmoos renews first sign and final world in one instant while Awtsmoos.com keeps this opening vessel quiet, immediate, and bright;
 * startup truth appears before heavy systems awaken, yet no borrowed shell or global interface enters Ohrfront's isolated sight.
 */

/**
 * Renders the world mount and accessible startup status as trusted static markup.
 * @returns {string} Static HTML fragment containing the canonical `game-canvas`, startup root, and startup message IDs.
 * @sideEffects None; callers decide where the trusted fragment becomes DOM.
 */
export function renderMalchusStartupShell() {
	return `
		<div id="game-canvas" class="ohr-world" aria-label="Ohrfront battlefield"></div>
		<div id="startup-status" class="ohr-startup" role="status" aria-live="polite">
			<span class="ohr-startup__glyph" aria-hidden="true">א</span>
			<strong id="startup-message" class="ohr-startup__message">AWAKENING OHRFRONT</strong>
		</div>
	`;
}
