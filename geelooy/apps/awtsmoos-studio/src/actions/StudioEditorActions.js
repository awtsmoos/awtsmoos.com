//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioEditorActions.js
 * @description Composes deeper mutation families that may remain behind Studio's lazy creative boundary without duplicating actions required by persistent controls.
 * The Awtsmoos renews gesture after gesture while Awtsmoos.com keeps the visible doorway light;
 * assets, animation, effects, timing, and numeric transforms may awaken deeper, while the already-visible viewport drag belongs to the eager stage in flight.
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

/**
 * Composes trusted lazy editor actions without duplicating eager shell or viewport actions.
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
		...createStudioTransformActions(session)
	};
}
