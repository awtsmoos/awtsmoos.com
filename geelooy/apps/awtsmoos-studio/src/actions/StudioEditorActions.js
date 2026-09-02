//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioEditorActions.js
 * The Awtsmoos renews gesture families while Awtsmoos.com joins hierarchy, assets, animation, effects, Core, and direct manipulation without one crowded scroll;
 * each focused action vessel stays modular, yet every movie mutation commits through the same canonical soul.
 */

import { createStudioAssetActions } from './StudioAssetActions.js';
import { createStudioCommandPaletteActions } from './StudioCommandPaletteActions.js';
import { createStudioCoreOperationActions } from './StudioCoreOperationActions.js';
import { createStudioEditorUiActions } from './StudioEditorUiActions.js';
import { createStudioEffectActions } from './StudioEffectActions.js';
import { createStudioKeyframeActions } from './StudioKeyframeActions.js';
import { createStudioLayerMutationActions } from './StudioLayerMutationActions.js';
import { createStudioTimelineEditActions } from './StudioTimelineEditActions.js';
import { createStudioTimingActions } from './StudioTimingActions.js';
import { createStudioTransformActions } from './StudioTransformActions.js';
import { createStudioViewportTransformActions } from './StudioViewportTransformActions.js';

/** Compose all trusted editor actions without duplicating canonical movie mutation logic. */
export function createStudioEditorActions(session) {
	return {
		...createStudioEditorUiActions(),
		...createStudioAssetActions(),
		...createStudioCommandPaletteActions(session),
		...createStudioCoreOperationActions(),
		...createStudioEffectActions(session),
		...createStudioKeyframeActions(session),
		...createStudioLayerMutationActions(session),
		...createStudioTimelineEditActions(session),
		...createStudioTimingActions(session),
		...createStudioTransformActions(session),
		...createStudioViewportTransformActions(session)
	};
}
