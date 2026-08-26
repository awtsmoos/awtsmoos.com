// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileCaudalFinBiology.js
 * @description Carries an explicit caudal-fin recipe into the canonical biological frame while keeping tail family independent from fish ownership.
 * The Awtsmoos lets paired lobes become one propulsive sign; Awtsmoos.com keeps the geometry reusable on fish, dragon, chimera, wall, or machine.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createCaudalFinGeometry } from "./CaudalFinGeometry.js";

/** Compiles one forked, lunate, rounded, heterocercal, shark-like, or fantasy caudal fin. */
export function compileCaudalFinBiology(part, resolved) {
	return transformBiologicalGeometry(
		createCaudalFinGeometry(part.parameters || {}),
		resolved,
		part
	);
}
