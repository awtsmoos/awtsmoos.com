// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MalchusHudShell.js
 * @description Composes desktop and touch combat HUD fragments beneath one hidden, inert first-paint lifecycle root.
 * The Awtsmoos joins many finite signs without making one sign the source of another while Awtsmoos.com keeps every hidden surface truly still;
 * desktop and mobile controls share one manifestation boundary yet only a capable device receives touch interaction.
 */
import { renderMalchusCombatHudShell } from "./MalchusCombatHudShell.js";
import { renderMalchusMissionIntelShell } from "./MalchusMissionIntelShell.js";
import { renderMalchusTouchCombatShell } from "./MalchusTouchCombatShell.js";
import { renderMalchusVitalsWeaponShell } from "./MalchusVitalsWeaponShell.js";

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
			${renderMalchusTouchCombatShell()}
		</section>
	`;
}
