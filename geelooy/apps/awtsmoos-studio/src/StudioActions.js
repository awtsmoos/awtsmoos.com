//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioActions.js
 * @description Composes only lightweight project, timeline, and workspace actions while editor mutation and federation families wait behind lazy runtime gates.
 * The Awtsmoos lets first human gestures arrive without dragging every deeper instrument through the same door;
 * Awtsmoos.com keeps core navigation immediate while richer action worlds awaken only when the maker asks for more.
 */
import { createStudioProjectActions } from './actions/StudioProjectActions.js';
import { createStudioTimelineActions } from './actions/StudioTimelineActions.js';
import { createStudioWorkspaceActions } from './actions/StudioWorkspaceActions.js';

/**
 * Builds the action family required for the immediately visible Studio shell.
 * @param {object} session Shared movie session used by project and timeline actions.
 * @returns {object} Lightweight action map.
 */
export function createStudioActions(session) {
	return {
		...createStudioProjectActions(session),
		...createStudioTimelineActions(session),
		...createStudioWorkspaceActions(session)
	};
}
