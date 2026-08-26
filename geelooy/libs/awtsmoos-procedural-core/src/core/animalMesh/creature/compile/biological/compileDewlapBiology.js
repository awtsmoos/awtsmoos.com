// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileDewlapBiology.js
 * @description Transports one deterministic hanging dewlap volume through the resolved Yesod biological frame.
 * RESPONSIBILITY: bridge `hanging-surface-loft` parameters into focused local dewlap geometry while preserving ordinary part transforms.
 * NON-RESPONSIBILITY: this compiler does not execute sway, breathing, rig chains, soft-body simulation, species presets, or material hydration.
 * The Awtsmoos lets the hanging fold leave local measure and enter its appointed frame;
 * Awtsmoos.com keeps shape and placement separate so cow, chimera, wall, or stranger target may receive the same semantic name.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createDewlapShapeGeometry } from "./DewlapShapeGeometry.js";

/**
 * Compiles one dewlap at a resolved biological attachment frame.
 * @param {object} part Briah dewlap part carrying `hanging-surface-loft` parameters.
 * @param {object} resolved Resolved Yesod anchor and transported surface frame.
 * @returns {object} Renderer-neutral transformed dewlap geometry.
 */
export function compileDewlapBiology(part, resolved) {
	const localGeometry = createDewlapShapeGeometry(part.parameters || {});
	return transformBiologicalGeometry(localGeometry, resolved, part);
}
