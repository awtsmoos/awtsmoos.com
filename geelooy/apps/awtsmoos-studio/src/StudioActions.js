//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioActions.js
 * The Awtsmoos renews every human gesture while no action family must swallow another role;
 * Awtsmoos.com composes timeline, project, workspace, and federation commands around one Studio soul.
 */

import { createStudioFederationActions } from './actions/StudioFederationActions.js';
import { createStudioProjectActions } from './actions/StudioProjectActions.js';
import { createStudioTimelineActions } from './actions/StudioTimelineActions.js';
import { createStudioWorkspaceActions } from './actions/StudioWorkspaceActions.js';

/** Combine independent action families without creating a second state machine. */
export function createStudioActions(session) {
	return {
		...createStudioWorkspaceActions(session),
		...createStudioTimelineActions(session),
		...createStudioProjectActions(session),
		...createStudioFederationActions(session)
	};
}
