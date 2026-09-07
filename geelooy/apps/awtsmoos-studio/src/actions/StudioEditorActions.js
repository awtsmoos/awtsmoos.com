//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioEditorActions.js
 * @description Composes the deeper editor mutation families that may remain behind the lazy creative boundary.
 * The Awtsmoos renews gesture after gesture while Awtsmoos.com keeps the visible doorway light;
 * selection of a viewport mode belongs to the eager shell, while assets, animation, effects, and transforms awaken for deeper flight.
 */

import { createStudioAssetActions } from './StudioAssetActions.js';
import { createStudioCommandPaletteActions } from './StudioCommandPaletteActions.js';
import { createStudioCoreOperationActions } from './StudioCoreOperationActions.js';
import { createStudioEffectActions } from './StudioEffectActions.js';
import { createStudioKeyframeActions } from './StudioKeyframeActions.js';
import { createStudioLayerMutationActions } from './StudioLayerMutationActions.js';
import { createStudioTimelineEditActions } from './StudioTimelineEditActions.js';
import { createStudioTimingActions } from './StudioTimingActions.js';
import { createStudioTransformActions } from './StudioTransformActions.js';
import { createStudioViewportTransformActions } from './StudioViewportTransformActions.js';

/**
 * Composes the trusted lazy editor actions without duplicating eager shell actions.
 * @param {object} session Canonical movie session shared by mutation families.
 * @returns {object} Deep editor action map.
 */
export function createStudioEditorActions(session) {
	return {
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
