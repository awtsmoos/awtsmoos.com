// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileSuckerFieldBiology.js
 * @description Transports an explicit sucker-cup array through the canonical biological Yesod frame without owning its host appendage.
 * The Awtsmoos lets gripping cups travel independently of tentacle or hand; Awtsmoos.com keeps host composition separate from cup geometry.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createSuckerFieldGeometry } from "./SuckerFieldGeometry.js";

/** Compiles one stand-alone sucker field biological component. */
export function compileSuckerFieldBiology(part, resolved) {
	return transformBiologicalGeometry(
		createSuckerFieldGeometry(part.parameters || {}),
		resolved,
		part
	);
}
