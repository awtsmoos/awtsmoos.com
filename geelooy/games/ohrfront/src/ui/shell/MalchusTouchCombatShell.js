// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusTouchCombatShell.js
 * @description Manifests compact touch combat controls with deterministic pictograms and Hebrew identity instead of emoji or numbered text.
 * Malchus receives gesture and letter as visible keilim while the Awtsmoos renews every hand beyond its finite outline;
 * Awtsmoos.com lets pulse, burst, and lance become simple signs beside א, ש, and ל, so no platform emoji may distort the battle line.
 */
export function renderMalchusTouchCombatShell() {
	return `
		<div id="touch-combat" class="ohr-touch-combat" aria-label="Touch combat controls" aria-hidden="true" inert hidden>
			<div id="touch-move" class="ohr-touch-move" role="group" aria-label="Movement pad">
				<span class="ohr-touch-move__ring" aria-hidden="true"></span>
				<span id="touch-move-knob" class="ohr-touch-move__knob" aria-hidden="true"></span>
			</div>
			<div class="ohr-touch-weapons" aria-label="Weapon selection">
				<button type="button" class="ohr-touch-weapon" data-ohr-touch-weapon="0" aria-label="Aleph Pulse weapon" title="Aleph Pulse" aria-pressed="true"><span class="ohr-touch-weapon__icon ohr-touch-weapon__icon--pulse" aria-hidden="true"></span><span class="ohr-touch-weapon__glyph" aria-hidden="true">א</span></button>
				<button type="button" class="ohr-touch-weapon" data-ohr-touch-weapon="1" aria-label="Shin Burst weapon" title="Shin Burst" aria-pressed="false"><span class="ohr-touch-weapon__icon ohr-touch-weapon__icon--burst" aria-hidden="true"></span><span class="ohr-touch-weapon__glyph" aria-hidden="true">ש</span></button>
				<button type="button" class="ohr-touch-weapon" data-ohr-touch-weapon="2" aria-label="Lamed Lance weapon" title="Lamed Lance" aria-pressed="false"><span class="ohr-touch-weapon__icon ohr-touch-weapon__icon--lance" aria-hidden="true"></span><span class="ohr-touch-weapon__glyph" aria-hidden="true">ל</span></button>
			</div>
			<div class="ohr-touch-actions" aria-label="Combat actions">
				<button id="touch-sprint" type="button" class="ohr-touch-action" aria-pressed="false">RUN</button>
				<button id="touch-jump" type="button" class="ohr-touch-action">JUMP</button>
				<button id="touch-slide" type="button" class="ohr-touch-action" aria-pressed="false">SLIDE</button>
				<button id="touch-fire" type="button" class="ohr-touch-fire" aria-label="Fire weapon" aria-pressed="false">FIRE</button>
			</div>
		</div>
	`;
}
