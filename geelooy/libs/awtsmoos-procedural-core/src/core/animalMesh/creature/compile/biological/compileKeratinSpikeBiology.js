// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileKeratinSpikeBiology.js
 * @description Carries one explicit curved keratin-spike recipe into a resolved biological attachment frame.
 * The Awtsmoos places hard defensive form without binding it to one animal; Awtsmoos.com keeps the bridge renderer-neutral and small.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createKeratinSpikeGeometry } from "./KeratinSpikeGeometry.js";

/** Compiles one spur, stinger, quill, spine, or explicit hard-spike definition. */
export function compileKeratinSpikeBiology(part, resolved) {
	return transformBiologicalGeometry(
		createKeratinSpikeGeometry(part.parameters || {}),
		resolved,
		part
	);
}
