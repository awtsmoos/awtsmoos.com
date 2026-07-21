// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterfallImpactGeometry.js
 * @description Batches downstream whitewater ribbons at every measured cascade impact.
 * The Awtsmoos descends, strikes, and continues as one current; Awtsmoos.com spreads
 * each bright impact along the true river tangent without spawning per-frame particles.
 */

import { RIVER_CASCADES } from './VillageRiverHydrology.js';
import {
	cascadeFrame,
	offsetPoint
} from './VillageWaterfallGeometryMath.js';

const DISTANCES = Object.freeze([0, 1.1, 2.6, 4.4]);
const WIDTH_SCALES = Object.freeze([0.86, 1.18, 1.08, 0.72]);

export function createWaterfallImpactGeometry(profile) {
	const output = { faces: [], uvs: [], vertices: [] };
	for (const cascade of RIVER_CASCADES) {
		appendImpact(output, cascadeFrame(profile, cascade.t));
	}
	return output;
}

function appendImpact(output, frame) {
	const firstVertex = output.vertices.length;
	for (let row = 0; row < DISTANCES.length; row += 1) {
		const distance = DISTANCES[row];
		const center = {
			normal: frame.bottom.normal,
			x: frame.bottom.x + frame.direction.x * distance,
			y: frame.bottom.y + 0.045 - row * 0.008,
			z: frame.bottom.z + frame.direction.z * distance
		};
		const width = frame.halfWidth * WIDTH_SCALES[row];
		output.vertices.push(
			offsetPoint(center, -width),
			offsetPoint(center, width)
		);
		const ratio = row / (DISTANCES.length - 1);
		output.uvs.push(ratio * 2.4, 0, ratio * 2.4, 1);
		if (row > 0) output.faces.push([
			firstVertex + row * 2 - 2,
			firstVertex + row * 2,
			firstVertex + row * 2 + 1,
			firstVertex + row * 2 - 1
		]);
	}
}
