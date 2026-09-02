//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file loadStudioFederationActions.js
 * @description Opens provider, spatial, Animator, and MitzvahWorld action machinery only after a federation gesture is actually invoked.
 * The Awtsmoos lets distant specialist worlds remain beyond the first gate until a maker calls their name;
 * Awtsmoos.com then joins the established federation actions to the living movie session without making startup carry their flame.
 */
import { createStudioFederationActions } from '../../actions/StudioFederationActions.js';

/**
 * Creates the established federation action map against the already-living movie session.
 * @param {object} session Shared Studio movie session.
 * @returns {object} Federation action handlers.
 */
export function createStudioFeatureActions(session) {
	return createStudioFederationActions(session);
}
