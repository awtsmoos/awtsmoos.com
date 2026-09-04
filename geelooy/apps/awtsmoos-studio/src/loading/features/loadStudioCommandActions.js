//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file loadStudioCommandActions.js
 * @description Opens only the canonical command-mutation family for first-use Create/Edit/Animate command gestures.
 * The Awtsmoos lets a single creative word awaken only the vessels needed for its deed;
 * Awtsmoos.com keeps effects, timing, transforms, and Core asleep while a simple command plants its seed.
 */
import { createStudioCommandPaletteActions } from '../../actions/StudioCommandPaletteActions.js';

/** Creates the minimal command action map against the already-living movie session. */
export function createStudioFeatureActions(session) {
	return createStudioCommandPaletteActions(session);
}
