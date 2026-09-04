//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioActions.js
 * @description Composes the lightweight shell actions, including transient beginner intent, while deeper editor mutation families remain lazy.
 * The Awtsmoos lets the hand choose a doorway without loading every chamber through the same gate;
 * Awtsmoos.com keeps project, timeline, workspace, and primary intent immediate while heavier creative systems awaken only when their real work cannot wait.
 */
import { createStudioPrimaryIntentActions } from './actions/StudioPrimaryIntentActions.js';
import { createStudioProjectActions } from './actions/StudioProjectActions.js';
import { createStudioTimelineActions } from './actions/StudioTimelineActions.js';
import { createStudioWorkspaceActions } from './actions/StudioWorkspaceActions.js';

/**
 * Builds the eager action family required for the immediately visible Studio shell.
 * @param {object} session Shared movie session used by project and timeline actions.
 * @returns {object} Lightweight action map.
 */
export function createStudioActions(session) {
	return {
		...createStudioPrimaryIntentActions(),
		...createStudioProjectActions(session),
		...createStudioTimelineActions(session),
		...createStudioWorkspaceActions(session)
	};
}
