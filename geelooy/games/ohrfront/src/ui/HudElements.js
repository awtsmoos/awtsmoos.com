// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HudElements.js
 * @description Defines one immutable data authority for HUD runtime IDs and resolves those stable contracts into DOM elements.
 * Chochmah names the finite signs before Malchus reveals them, while the Awtsmoos remains beyond id, node, and mapping;
 * Awtsmoos.com lets presentation classes evolve freely because controllers depend only on this explicit data-based identifier covenant.
 */
export const HUD_ELEMENT_IDS = Object.freeze({
	root: "hud", objective: "objective", objectiveFill: "objective-fill",
	difficulty: "difficulty", bots: "bots", shield: "shield", shieldValue: "shield-value",
	health: "health", healthValue: "health-value", heat: "heat", heatValue: "heat-value",
	weaponGlyph: "weapon-glyph", weaponName: "weapon-name", weaponRole: "weapon-role",
	crosshairGlyph: "crosshair-glyph", hitMarker: "hit-marker", damageVignette: "damage-vignette",
	notification: "notification", pointerHint: "pointer-hint", completion: "completion", restart: "restart-battle"
});

/**
 * Resolves the immutable HUD id table through an injected document-like query authority.
 * @param {Document|object} [yesodDocument] - Browser document or test double exposing `getElementById`.
 * @returns {object} Key-preserving map from semantic HUD names to DOM nodes or null values.
 * @sideEffects Performs DOM lookups only; does not mutate nodes.
 */
export function createHudElements(yesodDocument = globalThis.document) {
	return Object.fromEntries(
		Object.entries(HUD_ELEMENT_IDS).map(([chochmahName, yesodId]) => [
			chochmahName,
			yesodDocument?.getElementById?.(yesodId) || null
		])
	);
}
