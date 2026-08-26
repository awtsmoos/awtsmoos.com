// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileFeatherBiology.js
 * @description Compiles one feather or a deterministic row/fan through the same individual-feather geometry law and canonical Yesod frame.
 * The Awtsmoos lets one feather become many without losing the unity of its geometry; Awtsmoos.com keeps array grammar from becoming species ownership.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createFeatherArrayGeometry } from "./FeatherArrayGeometry.js";
import { createFeatherGeometry } from "./FeatherGeometry.js";

/** Compiles explicit feather recipes without claiming the generic feather category. */
export function compileFeatherBiology(part, resolved) {
	const parameters = part.parameters || {};
	const recipe = String(parameters.biologicalGeometryRecipe || "single-feather");
	const geometry = recipe === "single-feather"
		? createFeatherGeometry(parameters)
		: createFeatherArrayGeometry(parameters);
	return transformBiologicalGeometry(geometry, resolved, part);
}
