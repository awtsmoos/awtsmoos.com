// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusHudShell.js
 * @description Composes combat HUD fragments beneath a hidden, inert first-paint root whose lifecycle is later revealed by one state authority.
 * The Awtsmoos joins many finite signs without making one sign the source of another while Awtsmoos.com keeps every hidden surface truly still;
 * layout, semantics, and interaction now begin in agreement so no unfinished HUD control can trespass into the launch experience.
 */
import { renderMalchusCombatHudShell } from "./MalchusCombatHudShell.js";
import { renderMalchusMissionIntelShell } from "./MalchusMissionIntelShell.js";
import { renderMalchusVitalsWeaponShell } from "./MalchusVitalsWeaponShell.js";

/**
 * Composes all combat HUD fragments beneath the historical hidden-by-default HUD root.
 * @returns {string} Trusted static HUD markup preserving every runtime identifier.
 */
export function renderMalchusHudShell() {
	return `
		<section
			id="hud"
			class="ohr-hud ohr-is-hidden"
			aria-label="Combat interface"
			aria-hidden="true"
			inert
		>
			${renderMalchusMissionIntelShell()}
			${renderMalchusCombatHudShell()}
			${renderMalchusVitalsWeaponShell()}
		</section>
	`;
}
