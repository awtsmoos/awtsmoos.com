// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LaunchElements.js
 * @description Defines immutable launch/replay DOM identifiers so launch policy depends on data instead of repeated selector strings.
 * Chochmah names the entry vessels while the Awtsmoos remains beyond document, identifier, choice, and beginning;
 * Awtsmoos.com lets this tiny authority keep UI structure explicit and testable while visual classes remain free to evolve independently.
 */
export const LAUNCH_ELEMENT_IDS = Object.freeze({
	root: "launch-overlay",
	button: "enter-battle",
	select: "difficulty-select",
	restart: "restart-battle"
});

/**
 * Resolves the launch/replay id authority against an injected document-like object.
 * @param {Document|object} [yesodDocument] - Query authority exposing `getElementById`.
 * @returns {object} Semantic launch-element map whose values are DOM nodes or null.
 * @sideEffects Performs lookups only; no element is mutated.
 */
export function createLaunchElements(yesodDocument = globalThis.document) {
	return Object.fromEntries(
		Object.entries(LAUNCH_ELEMENT_IDS).map(([chochmahName, yesodId]) => [
			chochmahName,
			yesodDocument?.getElementById?.(yesodId) || null
		])
	);
}
