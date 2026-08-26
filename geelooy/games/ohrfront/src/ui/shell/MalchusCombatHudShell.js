// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusCombatHudShell.js
 * @description Renders the centered aiming and transient combat-feedback surfaces without acquiring mission, vitality, or dialog responsibilities.
 * The Awtsmoos renews direction, impact, warning, and fleeting message while Awtsmoos.com lets these signs appear and vanish without permanent clutter in sight;
 * the center stays disciplined so motion, target, and terrain remain the greater battlefield light.
 */

/**
 * Renders the crosshair, hit marker, damage vignette, transient notification, and pointer-lock recovery hint.
 * @returns {string} Trusted static markup containing all central combat-feedback runtime IDs.
 * @sideEffects None; state and timing are owned by HUD controllers after manifestation.
 */
export function renderMalchusCombatHudShell() {
	return `
		<div id="crosshair" class="ohr-crosshair" aria-hidden="true">
			<i class="ohr-crosshair__line ohr-crosshair__line--north"></i>
			<i class="ohr-crosshair__line ohr-crosshair__line--east"></i>
			<i class="ohr-crosshair__line ohr-crosshair__line--south"></i>
			<i class="ohr-crosshair__line ohr-crosshair__line--west"></i>
			<span id="crosshair-glyph" class="ohr-crosshair__glyph">א</span>
		</div>
		<div id="hit-marker" class="ohr-hit-marker" aria-hidden="true">◇</div>
		<div id="damage-vignette" class="ohr-damage-vignette" aria-hidden="true"></div>
		<div id="notification" class="ohr-notification ohr-is-hidden" role="status"></div>
		<div id="pointer-hint" class="ohr-pointer-hint ohr-is-hidden">CLICK TO RE-ENTER</div>
	`;
}
