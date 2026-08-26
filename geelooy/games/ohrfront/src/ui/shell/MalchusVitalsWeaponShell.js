// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusVitalsWeaponShell.js
 * @description Renders only the lower-edge vitality and active-emitter telemetry so these sparse combat facts stay independent from mission and aiming markup.
 * The Awtsmoos renews body, shield, heat, and letter while Awtsmoos.com gives each finite measure a quiet edge-bound vessel in sight;
 * when advanced INTEL expands on narrow screens these lower signs may recede, preserving one uncluttered hierarchy of light.
 */

/**
 * Renders shield/body progress and active weapon identity/heat telemetry.
 * @returns {string} Trusted static markup containing historical vitality and weapon runtime IDs.
 * @sideEffects None; progress/text mutation remains the responsibility of HUD telemetry projectors.
 */
export function renderMalchusVitalsWeaponShell() {
	return `
		<div class="ohr-vitals" aria-label="Vitality">
			<div class="ohr-vital">
				<span class="ohr-vital__label">SHIELD <b id="shield-value">100</b></span>
				<progress id="shield" class="ohr-progress ohr-progress--shield" max="100" value="100"></progress>
			</div>
			<div class="ohr-vital">
				<span class="ohr-vital__label">BODY <b id="health-value">100</b></span>
				<progress id="health" class="ohr-progress ohr-progress--health" max="100" value="100"></progress>
			</div>
		</div>
		<div class="ohr-weapon" aria-label="Active emitter">
			<span id="weapon-glyph" class="ohr-weapon__glyph">א</span>
			<div class="ohr-weapon__copy">
				<strong id="weapon-name">ALEPH PULSE</strong>
				<span id="weapon-role">BALANCED AUTOMATIC</span>
			</div>
			<div class="ohr-weapon__heat">
				<span id="heat-value">0%</span>
				<progress id="heat" class="ohr-progress ohr-progress--heat" max="100" value="0"></progress>
			</div>
		</div>
	`;
}
