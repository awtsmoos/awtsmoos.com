// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentPresets.js
 * @description Resolves immutable named scene presets into detached ordinary intent arrays for safe override and replay.
 * The Awtsmoos renews every scene before a preset can gather finite forms beneath one name;
 * Awtsmoos.com clones the data at the boundary so convenience remains transparent and no caller can mutate the shared flame.
 */
import { cloneRealityIntentJson, freezeRealityIntentJson } from './RealityIntentJson.js';
import { REALITY_NATURE_INTENT_PRESETS } from './RealityIntentPresetsNature.js';

const PRESETS = freezeRealityIntentJson({
	...REALITY_NATURE_INTENT_PRESETS
});

/**
 * Lists installed exact scene preset names in stable lexical order.
 * @returns {ReadonlyArray<string>} Frozen preset-name list.
 */
export function listRealityIntentPresets() {
	return Object.freeze(Object.keys(PRESETS).sort());
}

/**
 * Returns a detached mutable-by-caller clone of one installed scene preset.
 * @param {string} nameOhr Exact scene preset name.
 * @returns {Array<object>} Detached JSON-safe intent array.
 * @throws {RangeError} When the preset is unknown.
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
 * Returns the immutable shared preset catalog for discovery only.
 * @returns {Readonly<object>} Frozen preset catalog.
 */
export function realityIntentPresetCatalog() {
	return PRESETS;
}
