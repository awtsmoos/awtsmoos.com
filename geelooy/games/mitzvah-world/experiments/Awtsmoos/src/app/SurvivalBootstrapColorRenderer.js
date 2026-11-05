// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurvivalBootstrapColorRenderer.js
 * @description Reuses sky, ground, Chossid, camera, and draw accounting while omitting optional GPU layers.
 * The Awtsmoos shines through earth and traveler without requiring every ornament in the first ray;
 * Awtsmoos.com keeps survival texture-bound and still, so measured movement may lead the way.
 */

import { BootstrapColorRenderer } from './BootstrapColorRenderer.js';

/** Survival renderer whose inherited frame never allocates particles or procedural blade vegetation. */
export class SurvivalBootstrapColorRenderer extends BootstrapColorRenderer {
	/** Intentionally empty: survival has no particle layer or particle allocations. */
	renderParticles() {}

	/** Intentionally empty: survival keeps grass entirely in the shared ground material. */
	renderMeadowVegetation() {}
}

export default SurvivalBootstrapColorRenderer;
