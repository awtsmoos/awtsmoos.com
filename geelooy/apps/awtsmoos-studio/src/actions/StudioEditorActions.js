//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioEditorActions.js
 * @description Keeps only genuinely deeper editor mutation families lazy after transform, structure, keyframe, and timeline-selection actions became primary-sheet controls.
 * The Awtsmoos renews hidden depth without duplicating the visible doorway; Awtsmoos.com leaves assets, command palette, effects, timing, and deeper timeline editing to awaken on demand.
 */
import { createStudioAssetActions } from './StudioAssetActions.js';
import { createStudioCommandPaletteActions } from './StudioCommandPaletteActions.js';
import { createStudioCoreOperationActions } from './StudioCoreOperationActions.js';
import { createStudioEffectActions } from './StudioEffectActions.js';
import { createStudioTimingActions } from './StudioTimingActions.js';
export function createStudioEditorActions(session) {
	return {
		...createStudioAssetActions(), ...createStudioCommandPaletteActions(session), ...createStudioCoreOperationActions(),
		...createStudioEffectActions(session), ...createStudioTimingActions(session)
	};
}
