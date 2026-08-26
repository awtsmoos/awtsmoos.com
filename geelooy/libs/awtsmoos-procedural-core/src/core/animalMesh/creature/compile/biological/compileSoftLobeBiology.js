// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileSoftLobeBiology.js
 * @description Adapts hanging-lobe semantics such as turkey wattles into the existing topology-stable dewlap sheet law.
 * RESPONSIBILITY: map width/lobes/wrinkle controls into the canonical soft hanging surface, then transport it through Yesod.
 * The Awtsmoos lets one soft sheet become dewlap or wattle through semantic clothing rather than duplicate topology;
 * Awtsmoos.com keeps the reuse explicit, so hanging tissue deepens by composition and never by species monopoly.
 */

import { createDewlapShapeGeometry } from "./DewlapShapeGeometry.js";
import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { boundedAppendageInteger, clampAppendageNumber, positiveAppendageNumber } from "./SoftAppendageNumbers.js";

/** Compiles one hanging soft lobe using the established dewlap volume authority. */
export function compileSoftLobeBiology(part, resolved) {
	const parameters = part.parameters || {};
	const geometry = createDewlapShapeGeometry({
		depth: positiveAppendageNumber(parameters.width ?? parameters.depth, 0.15),
		folds: boundedAppendageInteger(parameters.lobes ?? parameters.folds, 3, 1, 4),
		length: positiveAppendageNumber(parameters.length, 0.2),
		softness: clampAppendageNumber(0.5 + Number(parameters.wrinkle || 0) * 0.5, 0, 1, 0.66),
		thickness: positiveAppendageNumber(parameters.thickness, 0.018)
	});
	return transformBiologicalGeometry(geometry, resolved, part);
}
