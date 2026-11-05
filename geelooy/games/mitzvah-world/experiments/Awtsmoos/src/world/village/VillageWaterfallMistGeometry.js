// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterfallMistGeometry.js
 * @description Batches crossed impact veils without a CPU particle simulation.
 * The Awtsmoos lifts a fixed finite garment from each measured plunge; Awtsmoos.com
 * lets shader time breathe through crossed quads while construction remains deterministic.
 */

import { RIVER_CASCADES } from './VillageRiverHydrology.js';
import { cascadeFrame } from './VillageWaterfallGeometryMath.js';

export function createWaterfallMistGeometry(profile) {
	const output = { faces: [], uvs: [], vertices: [] };
	for (const [index, cascade] of RIVER_CASCADES.entries()) {
		appendMistCross(output, cascadeFrame(profile, cascade.t), index);
	}
	return output;
}

function appendMistCross(output, frame, index) {
	const centerX = frame.bottom.x + frame.direction.x * 0.62;
	const centerZ = frame.bottom.z + frame.direction.z * 0.62;
	const halfWidth = frame.halfWidth * (0.62 + index * 0.05);
	const bottomY = frame.bottom.y + 0.06;
	const topY = bottomY + 1.7 + index * 0.22;
	appendVeil(output, centerX, centerZ, bottomY, topY, {
		x: frame.bottom.normal.x,
		z: frame.bottom.normal.z
	}, halfWidth);
	appendVeil(output, centerX, centerZ, bottomY, topY, frame.direction, halfWidth * 0.72);
}

function appendVeil(output, centerX, centerZ, bottomY, topY, axis, halfWidth) {
	const start = output.vertices.length;
	output.vertices.push(
		[centerX - axis.x * halfWidth, bottomY, centerZ - axis.z * halfWidth],
		[centerX + axis.x * halfWidth, bottomY, centerZ + axis.z * halfWidth],
		[centerX + axis.x * halfWidth * 1.18, topY, centerZ + axis.z * halfWidth * 1.18],
		[centerX - axis.x * halfWidth * 1.18, topY, centerZ - axis.z * halfWidth * 1.18]
	);
	output.faces.push([start, start + 1, start + 2, start + 3]);
	output.uvs.push(0, 1, 1, 1, 1, 0, 0, 0);
}
