// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileSoftNoduleFieldBiology.js
 * @description Transports a deterministic soft-nodule field through the canonical biological attachment frame.
 * The Awtsmoos lets many surface nodes become one composable field while Awtsmoos.com keeps placement and rendering apart;
 * caruncle, tubercle, glowing organ, or fantasy growth may therefore travel through the same renderer-neutral heart.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createSoftNoduleFieldGeometry } from "./SoftNoduleFieldGeometry.js";

/** Compiles one explicit `soft-nodule-field` biological recipe. */
export function compileSoftNoduleFieldBiology(part, resolved) {
	return transformBiologicalGeometry(
		createSoftNoduleFieldGeometry(part.parameters || {}),
		resolved,
		part
	);
}
