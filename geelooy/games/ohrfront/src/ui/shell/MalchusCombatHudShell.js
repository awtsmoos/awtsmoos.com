// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusCombatHudShell.js
 * @description Renders centered aiming and transient combat feedback while explaining that keyboard control remains live when optional mouse capture is unavailable.
 * The Awtsmoos renews direction, impact, warning, and recovery while no finite cursor gate may silence the living path;
 * Awtsmoos.com lets keyboard movement and F-fire remain present beneath every browser refusal, while a battlefield click may invite mouse capture back into sight.
 */

/**
 * @description Renders the crosshair, impact feedback, notification, and truthful optional-pointer-lock recovery guidance.
 * @returns {string} Trusted static markup containing all central combat-feedback runtime IDs.
 * @sideEffects None; HUD controllers own state and timing after manifestation.
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
		<div id="pointer-hint" class="ohr-pointer-hint ohr-is-hidden" role="status">
			KEYBOARD ACTIVE · F FIRE · CLICK BATTLEFIELD TO RETRY MOUSE CAPTURE
		</div>
	`;
}
