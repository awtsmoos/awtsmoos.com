//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioActions.js
 * @description Composes shell actions that must answer wherever persistent Studio controls are already visible, including real viewport pointer transformation.
 * The Awtsmoos renews the visible doorway before hidden chambers rise in light;
 * Awtsmoos.com keeps audio, mode, project memory, scenes, history, timeline breath, workspace direction, and the stage gizmo immediately alive and right.
 */
import { createStudioAudioActions } from './actions/StudioAudioActions.js';
import { createStudioEditorUiActions } from './actions/StudioEditorUiActions.js';
import { createStudioHistoryActions } from './actions/StudioHistoryActions.js';
import { createStudioPrimaryIntentActions } from './actions/StudioPrimaryIntentActions.js';
import { createStudioProjectActions } from './actions/StudioProjectActions.js';
import { createStudioSceneActions } from './actions/StudioSceneActions.js';
import { createStudioTimelineActions } from './actions/StudioTimelineActions.js';
import { createStudioViewportTransformActions } from './actions/StudioViewportTransformActions.js';
import { createStudioWorkspaceActions } from './actions/StudioWorkspaceActions.js';

/** Build the eager action family required for the immediately visible Studio shell and viewport. */
export function createStudioActions(session) {
	return {
		...createStudioAudioActions(session),
		...createStudioEditorUiActions(),
		...createStudioHistoryActions(session),
		...createStudioPrimaryIntentActions(),
		...createStudioProjectActions(session),
		...createStudioSceneActions(session),
		...createStudioTimelineActions(session),
		...createStudioViewportTransformActions(session),
		...createStudioWorkspaceActions(session)
	};
}
