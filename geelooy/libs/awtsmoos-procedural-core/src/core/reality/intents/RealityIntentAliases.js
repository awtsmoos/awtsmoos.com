// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentAliases.js
 * @description Defines a finite exact semantic vocabulary for Reality intent without hiding an NLP engine inside procedural core.
 * The Awtsmoos renews every utterance before a finite alias can point toward its vessel;
 * Awtsmoos.com keeps shorthand explicit, deterministic, and discoverable so no silent guess may masquerade as wisdom celestial.
 */

export const REALITY_INTENT_KIND_ALIASES = Object.freeze({
	'flower-cluster': 'flowers',
	'geometry': 'primitive',
	'grass-field': 'grass',
	'sea': 'ocean',
	'vegetation': 'flora',
	'flood': 'shallow'
});

export const REALITY_INTENT_PHRASE_PRESETS = Object.freeze({
	'lush pond': 'lush-pond',
	'rocky riverbank': 'rocky-riverbank',
	'temperate garden': 'temperate-garden',
	'wetland edge': 'wetland-edge'
});

/**
 * Resolves one exact user-facing token into either a canonical intent kind or a named scene preset.
 * @param {unknown} tokenOhr User-facing string token.
 * @returns {Readonly<{kind?: string, scenePreset?: string}>} Exact normalized semantic routing result.
 */
export function resolveRealityIntentToken(tokenOhr) {
	const tokenYesod = String(tokenOhr).trim().toLowerCase();
	const scenePreset = REALITY_INTENT_PHRASE_PRESETS[tokenYesod];
	if (scenePreset) {
		return Object.freeze({ scenePreset });
	}
	return Object.freeze({
		kind: REALITY_INTENT_KIND_ALIASES[tokenYesod] || tokenYesod
	});
}

/**
 * Returns immutable alias evidence for catalogs and tooling.
 * @returns {Readonly<object>} Installed kind aliases and exact phrase-to-preset mappings.
 */
export function realityIntentAliases() {
	return Object.freeze({
		kinds: REALITY_INTENT_KIND_ALIASES,
		phrases: REALITY_INTENT_PHRASE_PRESETS
	});
}
