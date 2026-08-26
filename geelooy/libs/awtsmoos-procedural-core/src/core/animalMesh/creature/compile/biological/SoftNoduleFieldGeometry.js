// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SoftNoduleFieldGeometry.js
 * @description Creates deterministic soft biological nodule fields for caruncles, tubercles, display bumps, and fantasy surface organs.
 * RESPONSIBILITY: place bounded smooth nodules through a golden-angle field without consuming global random streams.
 * NON-RESPONSIBILITY: this file does not project onto arbitrary mesh UVs, own material color, or simulate vascular motion.
 * The Awtsmoos scatters many little vessels while one deterministic law keeps unrelated randomness still;
 * Awtsmoos.com lets caruncle, tubercle, luminous node, or strange organ field attach to any surface by semantic will.
 */

import { joinMeshParts } from "../../../geometry/joinMeshParts.js";
import { buildEllipsoidFromCommand } from "../../../geometry/primitiveBuilder.js";
import { boundedAppendageInteger, clampAppendageNumber, positiveAppendageNumber } from "./SoftAppendageNumbers.js";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Creates one local nodule field with deterministic low-discrepancy placement. */
export function createSoftNoduleFieldGeometry(parameters = {}) {
	const density = clampAppendageNumber(parameters.density, 0, 1, 0.58);
	const count = boundedAppendageInteger(parameters.count, Math.round(6 + density * 18), 1, 32);
	const size = positiveAppendageNumber(parameters.size, 0.012);
	const height = positiveAppendageNumber(parameters.height, 0.009);
	const variation = clampAppendageNumber(parameters.sizeVariation, 0, 1, 0.42);
	const clustering = clampAppendageNumber(parameters.clustering, 0, 1, 0.36);
	const fieldRadius = size * (2.5 + Math.sqrt(count) * 0.8) * (1 - clustering * 0.42);
	return joinMeshParts(Array.from({ length: count }, (_, index) => createNodule({
		index,
		count,
		fieldRadius,
		size,
		height,
		variation
	})));
}

/** Creates one smooth nodule at a deterministic golden-angle point. */
function createNodule(values) {
	const fraction = (values.index + 0.5) / values.count;
	const radius = values.fieldRadius * Math.sqrt(fraction);
	const angle = values.index * GOLDEN_ANGLE;
	const variationWave = Math.sin((values.index + 1) * 12.9898) * values.variation * 0.24;
	const scale = 1 + variationWave;
	return {
		id: `soft-nodule-${values.index + 1}`,
		...buildEllipsoidFromCommand({
			args: {
				center: [Math.cos(angle) * radius, Math.sin(angle) * radius, values.height * 0.5],
				radii: [values.size * scale, values.size * scale, values.height * scale],
				vertical_segments: 6,
				radial_segments: 8
			}
		})
	};
}
