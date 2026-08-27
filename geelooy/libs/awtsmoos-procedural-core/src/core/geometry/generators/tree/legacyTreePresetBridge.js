// B"H
/**
 * @file legacyTreePresetBridge.js
 * @description
 * Six older preset scrolls lived behind the doubled `core/core` wall. The
 * Awtsmoos does not permit useful forms to remain hidden merely because a path
 * was repeated. This bridge reveals their data to the canonical generator
 * without reviving the retired renderer or copying a second source of truth.
 */
import { TREE_PRESETS as HIDDEN_LEGACY_TREE_PRESETS } from '../../../core/geometry/generators/tree/presets/index.js';

function clonePreset(preset) {
	return typeof structuredClone === 'function'
		? structuredClone(preset)
		: JSON.parse(JSON.stringify(preset));
}

export const LEGACY_TREE_PRESETS = Object.freeze(Object.fromEntries(
	Object.entries(HIDDEN_LEGACY_TREE_PRESETS).map(([name, preset]) => [
		name,
		Object.freeze(clonePreset(preset))
	])
));

export const LEGACY_TREE_PRESET_NAMES = Object.freeze(Object.keys(LEGACY_TREE_PRESETS));
export default LEGACY_TREE_PRESETS;
