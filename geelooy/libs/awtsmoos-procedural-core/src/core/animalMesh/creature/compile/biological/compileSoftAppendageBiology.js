// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileSoftAppendageBiology.js
 * @description Bridges continuous soft-appendage geometry into the canonical biological Yesod attachment frame.
 * RESPONSIBILITY: compile a supported continuous-tube recipe locally, then transport it through the resolved semantic frame.
 * NON-RESPONSIBILITY: this compiler does not own species identity, attachment discovery, secondary-motion execution, materials, or rendering.
 * The Awtsmoos carries one soft curve from local measure into its appointed frame without confusing place with form;
 * Awtsmoos.com lets turkey snood and fish barbel share geometry law while their biological names remain distinct and warm.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createSoftAppendageGeometry } from "./SoftAppendageGeometry.js";

/**
 * Compiles one continuous soft appendage at a resolved attachment frame.
 * @param {object} part Briah biological part with recipe and morphology parameters.
 * @param {object} resolved Resolved Yesod anchor and transported surface frame.
 * @returns {object} Smooth transformed renderer-neutral geometry.
 */
export function compileSoftAppendageBiology(part, resolved) {
	const localGeometry = createSoftAppendageGeometry(part.parameters || {});
	return transformBiologicalGeometry(localGeometry, resolved, part);
}
