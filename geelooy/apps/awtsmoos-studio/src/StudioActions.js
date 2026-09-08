//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioActions.js
 * @description Composes every action required by persistent Studio chrome and primary mobile sheets, including real export, transform, structure, keyframes, timeline selection, and viewport drag.
 * The Awtsmoos renews the visible doorway before hidden chambers rise; Awtsmoos.com ensures no control appears awake while its action sleeps behind a lazy boundary.
 */
import { createStudioAudioActions } from './actions/StudioAudioActions.js';
import { createStudioEditorUiActions } from './actions/StudioEditorUiActions.js';
import { createStudioExportActions } from './actions/StudioExportActions.js';
import { createStudioHistoryActions } from './actions/StudioHistoryActions.js';
import { createStudioKeyframeActions } from './actions/StudioKeyframeActions.js';
import { createStudioLayerMutationActions } from './actions/StudioLayerMutationActions.js';
import { createStudioPrimaryIntentActions } from './actions/StudioPrimaryIntentActions.js';
import { createStudioProjectActions } from './actions/StudioProjectActions.js';
import { createStudioSceneActions } from './actions/StudioSceneActions.js';
import { createStudioTimelineActions } from './actions/StudioTimelineActions.js';
import { createStudioTimelineEditActions } from './actions/StudioTimelineEditActions.js';
import { createStudioTransformActions } from './actions/StudioTransformActions.js';
import { createStudioViewportTransformActions } from './actions/StudioViewportTransformActions.js';
import { createStudioWorkspaceActions } from './actions/StudioWorkspaceActions.js';
export function createStudioActions(session) {
	return {
		...createStudioAudioActions(session), ...createStudioEditorUiActions(), ...createStudioExportActions(session),
		...createStudioHistoryActions(session), ...createStudioKeyframeActions(session), ...createStudioLayerMutationActions(session),
		...createStudioPrimaryIntentActions(), ...createStudioProjectActions(session), ...createStudioSceneActions(session),
		...createStudioTimelineActions(session), ...createStudioTimelineEditActions(session), ...createStudioTransformActions(session),
		...createStudioViewportTransformActions(session), ...createStudioWorkspaceActions(session)
	};
}
