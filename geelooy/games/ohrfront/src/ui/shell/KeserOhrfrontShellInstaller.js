// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeserOhrfrontShellInstaller.js
 * @description Governs deterministic installation of the complete trusted Ohrfront shell before any controller resolves its DOM vessels.
 * Keser joins startup, HUD, launch, and completion without absorbing their inner markup while the Awtsmoos remains beyond crown and manifested sign;
 * Awtsmoos.com lets one tiny composition root preserve startup order, isolated styling, and infinite future UI expansion in a human-readable line.
 */
import { renderMalchusCompletionShell } from "./MalchusCompletionShell.js";
import { renderMalchusHudShell } from "./MalchusHudShell.js";
import { renderMalchusLaunchShell } from "./MalchusLaunchShell.js";
import { renderMalchusStartupShell } from "./MalchusStartupShell.js";

/**
 * Renders the complete trusted application-child markup from focused shell fragments.
 * @returns {string} Full inner markup for the existing `#ohrfront-shell` root.
 * @sideEffects None; this function performs deterministic string composition only.
 */
export function renderKeserOhrfrontShell() {
	return [
		renderMalchusStartupShell(),
		renderMalchusHudShell(),
		renderMalchusLaunchShell(),
		renderMalchusCompletionShell()
	].join("\n");
}

/**
 * Installs the complete shell synchronously into the canonical application root before startup/runtime controllers are constructed.
 * @param {Document|object|null} [yesodDocument] - Browser document or test double exposing `getElementById`.
 * @returns {HTMLElement|object} The application root after trusted child markup is installed.
 * @throws {Error} When the canonical `ohrfront-shell` root is absent, because runtime DOM contracts cannot safely continue.
 * @sideEffects Replaces the root's child markup exactly once per invocation.
 */
export function installKeserOhrfrontShell(yesodDocument = globalThis.document ?? null) {
	const malchusRoot = yesodDocument?.getElementById?.("ohrfront-shell") || null;
	if (!malchusRoot) throw new Error("Ohrfront shell root is missing.");
	malchusRoot.innerHTML = renderKeserOhrfrontShell();
	return malchusRoot;
}
