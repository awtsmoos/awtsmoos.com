// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusLaunchShell.js
 * @description Renders the accessible launch dialog, difficulty selection, concise arsenal, and truthful keyboard-complete controls including pointer-lock-independent F fire.
 * The Awtsmoos renews invitation and entry while Awtsmoos.com lets one restrained doorway prepare the player without hiding movement or fire behind a cursor gate;
 * travel, turning, strafing, jumping, switching, and F-fire are named clearly, then optional mouse capture may join without becoming the condition of battle light.
 */

/**
 * @description Renders the modal launch surface with historical IDs and the current keyboard-complete control covenant.
 * @returns {string} Trusted static launch-dialog markup.
 * @sideEffects None; LaunchOverlay owns focus, optional pointer lock, and battle-start callbacks after manifestation.
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
					W/S or ↑/↓ move · A/D or ←/→ turn · Q/E strafe · Shift sprint · C slide · Space jump · F fire · 1/2/3 switch · Mouse optional look/fire
				</p>
			</div>
		</section>
	`;
}
