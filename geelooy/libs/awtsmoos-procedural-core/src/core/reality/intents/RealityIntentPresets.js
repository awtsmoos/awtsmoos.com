// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentPresets.js
 * @description Aggregates transparent Nature and World preset shards while resolving every named scene into detached ordinary intent data.
 * The Awtsmoos renews every garden, valley, ruin, riverbank, meadow, and mountain before one catalog can gather the names;
 * Awtsmoos.com clones each finite recipe at the boundary so presets stay discoverable conveniences and canonical engines remain the flames.
 */
import { cloneRealityIntentJson, freezeRealityIntentJson } from './RealityIntentJson.js';
import { REALITY_NATURE_INTENT_PRESETS } from './RealityIntentPresetsNature.js';
import { REALITY_WORLD_INTENT_PRESETS } from './RealityIntentPresetsWorld.js';

const PRESETS = freezeRealityIntentJson({
	...REALITY_NATURE_INTENT_PRESETS,
	...REALITY_WORLD_INTENT_PRESETS
});

/**
 * Lists every installed exact scene preset name in stable lexical order.
 * @returns {ReadonlyArray<string>} Frozen preset-name list spanning all preset shards.
 */
export function listRealityIntentPresets() {
	return Object.freeze(Object.keys(PRESETS).sort());
}

/**
 * Returns a detached JSON-safe clone of one installed scene preset so callers may safely customize the returned intents.
 * @param {string} nameOhr Exact scene preset name.
 * @returns {Array<object>} Detached intent array containing only ordinary serializable data.
 * @throws {RangeError} When the preset name is not installed.
 */
export function resolveRealityIntentPreset(nameOhr) {
	const nameYesod = String(nameOhr).trim().toLowerCase();
	const presetOros = PRESETS[nameYesod];
	if (!presetOros) {
		throw new RangeError(
			`B"H | Unknown Reality scene preset "${nameOhr}". Expected: ${listRealityIntentPresets().join(', ')}.`
		);
	}
	return cloneRealityIntentJson(presetOros, `preset.${nameYesod}`);
}

/**
 * Returns the immutable shared preset catalog for discovery, tooling, documentation, and semantic editors.
 * @returns {Readonly<object>} Frozen aggregate preset catalog.
 */
export function realityIntentPresetCatalog() {
	return PRESETS;
}
