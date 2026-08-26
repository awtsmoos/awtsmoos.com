// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusMissionIntelShell.js
 * @description Renders the sparse mission strip and the optional retractable tactical-intelligence disclosure as one semantic HUD region.
 * The Awtsmoos renews command and hidden knowledge without making either a permanent wall of noise in sight;
 * Awtsmoos.com lets the mission remain present while deeper evidence waits behind one deliberate INTEL gate of light.
 */

/**
 * Renders mission telemetry plus the collapsed-by-default advanced intelligence disclosure.
 * @returns {string} Trusted static markup containing mission/objective and every `hud-intel-*` runtime identifier.
 * @sideEffects None; this module owns markup data only.
 */
export function renderMalchusMissionIntelShell() {
	return `
		<header class="ohr-mission">
			<div class="ohr-mission__primary">
				<small class="ohr-mission__location">HAR HAOHR</small>
				<strong id="objective" class="ohr-mission__objective">SECURE BEACON א</strong>
			</div>
			<div class="ohr-mission__meta">
				<span id="difficulty">VANGUARD</span>
				<span id="bots">8 HOSTILES</span>
			</div>
			<div class="ohr-mission__track" aria-hidden="true">
				<span id="objective-fill" class="ohr-mission__fill"></span>
			</div>
		</header>
		<div class="ohr-intel">
			<button id="hud-intel-toggle" class="ohr-intel__toggle" type="button" aria-controls="hud-intel-panel" aria-expanded="false">
				<span>INTEL</span>
				<i aria-hidden="true">⌃</i>
			</button>
			<aside id="hud-intel-panel" class="ohr-intel__panel" aria-label="Combat intelligence" aria-hidden="true">
				<header class="ohr-intel__header">
					<span>TACTICAL INTELLIGENCE</span>
					<small>I TOGGLE</small>
				</header>
				<div class="ohr-intel__grid">
					<span>COGNITION</span>
					<strong id="hud-intel-difficulty">VANGUARD</strong>
					<span>HOSTILES</span>
					<strong id="hud-intel-hostiles">0</strong>
					<span>RESERVE</span>
					<strong id="hud-intel-reinforcements">0</strong>
					<span>DISPERSED</span>
					<strong id="hud-intel-kills">0</strong>
				</div>
				<div class="ohr-intel__objective">
					<span>ACTIVE DIRECTIVE</span>
					<strong id="hud-intel-objective">SECURE BEACON א</strong>
					<progress id="hud-intel-progress" max="100" value="0"></progress>
				</div>
			</aside>
		</div>
	`;
}
