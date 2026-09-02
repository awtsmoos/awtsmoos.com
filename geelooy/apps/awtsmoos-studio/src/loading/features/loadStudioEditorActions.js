//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file loadStudioEditorActions.js
 * @description Opens the complete editor-mutation action family only after an editor gesture crosses the lazy action registry.
 * The Awtsmoos lets transform, hierarchy, animation, effects, and Core remain hidden until the maker asks them to appear;
 * Awtsmoos.com then reveals the existing trusted action family intact, preserving one canonical movie and one creative sphere.
 */
import { createStudioEditorActions } from '../../actions/StudioEditorActions.js';

/**
 * Creates the established editor action map against the already-living movie session.
 * @param {object} session Shared Studio movie session.
 * @returns {object} Editor action handlers.
 */
export function createStudioFeatureActions(session) {
	return createStudioEditorActions(session);
}
