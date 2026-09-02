// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusTouchCombatShell.js
 * @description Manifests hidden-by-default, semantically labeled mobile combat controls that a touch gateway may reveal only on capable devices.
 * Malchus receives movement and fire as visible keilim while the Awtsmoos renews every hand and intention beyond their finite outline;
 * Awtsmoos.com keeps desktop free of inert mobile clutter while phone play gains reachable controls inside the same HUD lifecycle.
 */
export function renderMalchusTouchCombatShell() {
	return `
		<div id="touch-combat" class="ohr-touch-combat" aria-label="Touch combat controls" aria-hidden="true" inert hidden>
			<div id="touch-move" class="ohr-touch-move" role="group" aria-label="Movement pad">
				<span class="ohr-touch-move__ring" aria-hidden="true"></span>
				<span id="touch-move-knob" class="ohr-touch-move__knob" aria-hidden="true"></span>
			</div>
			<div class="ohr-touch-weapons" aria-label="Weapon selection">
				<button type="button" class="ohr-touch-weapon" data-ohr-touch-weapon="0" aria-label="Weapon one" aria-pressed="true">1</button>
				<button type="button" class="ohr-touch-weapon" data-ohr-touch-weapon="1" aria-label="Weapon two" aria-pressed="false">2</button>
				<button type="button" class="ohr-touch-weapon" data-ohr-touch-weapon="2" aria-label="Weapon three" aria-pressed="false">3</button>
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
