// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChochmahHudIntelElements.js
 * @description Defines the immutable DOM-id covenant for Ohrfront's retractable combat-intelligence disclosure.
 * Chochmah names each finite sign before it is revealed, while the Awtsmoos remains beyond identifier, panel, number, and sight;
 * Awtsmoos.com lets this data authority keep JavaScript independent from styling classes so responsive presentation can evolve without API drift.
 */
export const HUD_INTEL_ELEMENT_IDS = Object.freeze({
	host: "hud",
	toggle: "hud-intel-toggle",
	panel: "hud-intel-panel",
	difficulty: "hud-intel-difficulty",
	hostiles: "hud-intel-hostiles",
	reinforcements: "hud-intel-reinforcements",
	kills: "hud-intel-kills",
	objective: "hud-intel-objective",
	progress: "hud-intel-progress"
});

/**
 * Resolves the immutable intelligence-id table through an injected document-like authority.
 * @param {Document|object|null} [yesodDocument] - Browser document or test double exposing `getElementById`.
 * @returns {object} Semantic element map whose values are resolved nodes or null when unavailable.
 * @sideEffects Performs DOM lookups only and never mutates the resolved elements.
 */
export function createChochmahHudIntelElements(yesodDocument = globalThis.document ?? null) {
	return Object.fromEntries(
		Object.entries(HUD_INTEL_ELEMENT_IDS).map(([chochmahName, yesodId]) => [
			chochmahName,
			yesodDocument?.getElementById?.(yesodId) || null
		])
	);
}
