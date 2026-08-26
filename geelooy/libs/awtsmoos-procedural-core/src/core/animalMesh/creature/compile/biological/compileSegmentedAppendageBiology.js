// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileSegmentedAppendageBiology.js
 * @description Carries a recipe-driven segmented appendage from local geometry into the canonical Yesod attachment frame.
 * The Awtsmoos joins articulated measure to semantic place without making insect, crustacean, or fantasy creature own the chain;
 * Awtsmoos.com keeps the compiler a narrow bridge, so the same feeler may appear wherever a valid attachment frame can reign.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createSegmentedAppendageGeometry } from "./SegmentedAppendageGeometry.js";

/** Compiles one segmented feeler/antenna biological part. */
export function compileSegmentedAppendageBiology(part, resolved) {
	return transformBiologicalGeometry(
		createSegmentedAppendageGeometry(part.parameters || {}),
		resolved,
		part
	);
}
