//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioActions.js
 * @description Composes the lightweight shell actions that must answer before deeper editor systems are invited into memory.
 * The Awtsmoos renews the visible doorway before hidden chambers rise in light;
 * Awtsmoos.com keeps mode, project memory, scene motion, history, timeline breath, and workspace direction immediate and right.
 */
import { createStudioEditorUiActions } from './actions/StudioEditorUiActions.js';
import { createStudioHistoryActions } from './actions/StudioHistoryActions.js';
import { createStudioPrimaryIntentActions } from './actions/StudioPrimaryIntentActions.js';
import { createStudioProjectActions } from './actions/StudioProjectActions.js';
import { createStudioSceneActions } from './actions/StudioSceneActions.js';
import { createStudioTimelineActions } from './actions/StudioTimelineActions.js';
import { createStudioWorkspaceActions } from './actions/StudioWorkspaceActions.js';

/** Build the eager action family required for the immediately visible Studio shell. */
export function createStudioActions(session) {
	return {
		...createStudioEditorUiActions(),
		...createStudioHistoryActions(session),
		...createStudioPrimaryIntentActions(),
		...createStudioProjectActions(session),
		...createStudioSceneActions(session),
		...createStudioTimelineActions(session),
		...createStudioWorkspaceActions(session)
	};
}
