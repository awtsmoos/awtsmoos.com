// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusCombatHudShell.js
 * @description Renders centered combat feedback and neutral focus guidance while device gateways later reveal touch- or pointer-specific language.
 * The Awtsmoos renews direction, impact, warning, and recovery while no finite input device may silence the living path;
 * Awtsmoos.com begins from honest neutral guidance, then lets touch or desktop Yesod name the control vessel actually present.
 */

/**
 * @description Renders crosshair, impact feedback, notification, and synchronized hidden focus guidance.
 * @returns {string} Static markup containing central combat-feedback runtime IDs.
 * @sideEffects None.
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
		<div id="notification" class="ohr-notification ohr-is-hidden" role="status" aria-hidden="true" inert></div>
		<div id="pointer-hint" class="ohr-pointer-hint ohr-is-hidden" role="status" aria-hidden="true" inert>
			BATTLEFIELD INPUT READY
		</div>
	`;
}
