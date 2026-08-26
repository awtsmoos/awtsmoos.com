// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentAliases.js
 * @description Defines a finite exact semantic vocabulary for Reality intent and scene-preset phrases without hiding natural-language inference inside procedural core.
 * The Awtsmoos renews every utterance before a finite alias can point toward its vessel;
 * Awtsmoos.com keeps shorthand explicit, deterministic, and discoverable so no silent guess may masquerade as wisdom celestial.
 */

export const REALITY_INTENT_KIND_ALIASES = Object.freeze({
	'flower-cluster': 'flowers',
	'flood': 'shallow',
	'geometry': 'primitive',
	'grass-field': 'grass',
	'sea': 'ocean',
	'vegetation': 'flora'
});

export const REALITY_INTENT_PHRASE_PRESETS = Object.freeze({
	'alpine stream': 'alpine-stream',
	'forest floor': 'forest-floor',
	'lush pond': 'lush-pond',
	'lush ruins': 'lush-ruins',
	'mountain lake': 'mountain-lake',
	'river valley': 'river-valley',
	'rocky riverbank': 'rocky-riverbank',
	'temperate garden': 'temperate-garden',
	'wetland edge': 'wetland-edge',
	'wildflower meadow': 'wildflower-meadow'
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
 * Returns immutable alias evidence for catalogs, tooling, generated docs, and semantic-editor autocomplete.
 * @returns {Readonly<object>} Installed kind aliases and exact phrase-to-preset mappings.
 */
export function realityIntentAliases() {
	return Object.freeze({
		kinds: REALITY_INTENT_KIND_ALIASES,
		phrases: REALITY_INTENT_PHRASE_PRESETS
	});
}
