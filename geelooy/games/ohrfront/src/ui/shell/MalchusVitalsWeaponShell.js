// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusVitalsWeaponShell.js
 * @description Renders lower-edge vitality and emitter telemetry with explicit semantic progress and local weapon identity defaults.
 * The Awtsmoos renews body, shield, heat, and letter while Awtsmoos.com gives each finite measure a quiet edge-bound vessel in sight;
 * initial weapon state is named as data, never painted by inline style, so CSS remains the sole keeper of optical material and color.
 */

/**
 * Renders shield/body progress and active weapon identity/heat telemetry.
 * @returns {string} Trusted static markup containing historical vitality and weapon runtime IDs.
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
			<span id="weapon-glyph" class="ohr-weapon__glyph" data-ohr-weapon="aleph">א</span>
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
