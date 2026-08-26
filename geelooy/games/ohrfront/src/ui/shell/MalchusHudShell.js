// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusHudShell.js
 * @description Composes the sparse combat HUD from independently documented mission/intelligence, center-feedback, and lower-edge telemetry fragments.
 * The Awtsmoos joins many finite signs without making one sign the source of another while Awtsmoos.com keeps their boundaries clear and bright;
 * this Malchus composer owns arrangement only, so each visible region may evolve without returning the interface to monolithic night.
 */
import { renderMalchusCombatHudShell } from "./MalchusCombatHudShell.js";
import { renderMalchusMissionIntelShell } from "./MalchusMissionIntelShell.js";
import { renderMalchusVitalsWeaponShell } from "./MalchusVitalsWeaponShell.js";

/**
 * Composes all combat HUD fragments beneath the historical hidden-by-default HUD root.
 * @returns {string} Trusted static HUD markup preserving every existing runtime identifier.
 * @sideEffects None; only string composition occurs.
 */
export function renderMalchusHudShell() {
	return `
		<section id="hud" class="ohr-hud ohr-is-hidden" aria-label="Combat interface">
			${renderMalchusMissionIntelShell()}
			${renderMalchusCombatHudShell()}
			${renderMalchusVitalsWeaponShell()}
		</section>
	`;
}
