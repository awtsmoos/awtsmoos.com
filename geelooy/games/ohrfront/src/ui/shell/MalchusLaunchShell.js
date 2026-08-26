// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusLaunchShell.js
 * @description Renders the accessible launch dialog, difficulty selection, concise arsenal, and input guidance without mixing runtime startup mechanics into markup.
 * The Awtsmoos renews invitation and entry while Awtsmoos.com lets one restrained futuristic doorway prepare the player without cluttering the coming field;
 * cognition, arsenal, and controls are named clearly, then the dialog yields entirely to battle light.
 */

/**
 * Renders the modal launch surface with the historical selection and start-control IDs.
 * @returns {string} Trusted static launch-dialog markup.
 * @sideEffects None; LaunchOverlay owns focus, pointer lock, and battle-start callbacks after manifestation.
 */
export function renderMalchusLaunchShell() {
	return `
		<section id="launch-overlay" class="ohr-dialog-layer" role="dialog" aria-modal="true" aria-labelledby="launch-title">
			<div class="ohr-dialog ohr-dialog--launch">
				<p class="ohr-eyebrow">HAR HAOHR · CAMPAIGN 01</p>
				<h1 id="launch-title" class="ohr-title">OHRFRONT</h1>
				<h2 class="ohr-subtitle">ALEPH VANGUARD</h2>
				<p class="ohr-dialog__copy">
					Secure three light beacons across a living procedural warfront. Hostile squads perceive, communicate, flank,
					investigate sound, and lose certainty when sight breaks.
				</p>
				<p class="ohr-arsenal">
					<b>א</b> ALEPH PULSE <i>·</i> <b>ש</b> SHIN SCATTER <i>·</i> <b>ל</b> LAMED LANCE
				</p>
				<label class="ohr-field__label" for="difficulty-select">COMBAT INTELLIGENCE</label>
				<select id="difficulty-select" class="ohr-control ohr-select">
					<option value="pilgrim">Pilgrim — forgiving</option>
					<option value="warrior">Warrior — alert</option>
					<option value="vanguard" selected>Vanguard — tactical</option>
					<option value="nasi">Nasi — relentless</option>
					<option value="geulah">Geulah — maximum pressure</option>
				</select>
				<button id="enter-battle" class="ohr-control ohr-button ohr-button--primary" type="button">
					ENTER HAR HAOHR
				</button>
				<p class="ohr-controls-note">
					WASD move · Shift sprint · C slide · Space jump · 1/2/3 switch · I intel · Mouse fire
				</p>
			</div>
		</section>
	`;
}
