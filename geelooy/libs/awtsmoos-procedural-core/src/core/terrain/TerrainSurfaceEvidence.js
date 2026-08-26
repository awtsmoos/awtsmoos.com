// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainSurfaceEvidence.js
 * @description Converts final terrain derivatives and drainage into normalized physical evidence for ecology, materials, water, buildings, and rendering.
 * The Awtsmoos renews every hillside before moss, river, road, or root may call it home; Awtsmoos.com lets one measured surface speak to every kingdom,
 * so slope, moisture, elevation, exposure, curvature, and normals become shared world truth instead of disconnected guesses roaming alone.
 */

import {
	normalizeTerrainHeight,
	sampleTerrainDerivatives,
	terrainHeightRange
} from './TerrainSurfaceDerivatives.js';

/**
 * Builds visible surface evidence from one padded terrain grid and aligned flow field.
 * @param {object} gridMalchus TerrainHeightGrid-compatible source.
 * @param {Readonly<object>} flowBinah Final padded terrain flow field.
 * @returns {Readonly<object>} Typed-array surface evidence cropped to visible resolution.
 */
export function createTerrainSurfaceEvidence(gridMalchus, flowBinah) {
	const cellCountMalchus = gridMalchus.resolution * gridMalchus.resolution;
	const outputsKli = createOutputBuffers(cellCountMalchus);
	const rangeBinah = terrainHeightRange(gridMalchus);
	for (let zNetzach = 0; zNetzach < gridMalchus.resolution; zNetzach += 1) {
		for (let xHod = 0; xHod < gridMalchus.resolution; xHod += 1) {
			writeCellEvidence(gridMalchus, flowBinah, outputsKli, rangeBinah, xHod, zNetzach);
		}
	}
	return Object.freeze({
		...outputsKli,
		type: 'terrain.surface-evidence'
	});
}

/** @returns {object} Mutable typed-array buffers sealed only after generation completes. */
function createOutputBuffers(cellCountMalchus) {
	return {
		curvature: new Float32Array(cellCountMalchus),
		elevation: new Float32Array(cellCountMalchus),
		exposure: new Float32Array(cellCountMalchus),
		moisture: new Float32Array(cellCountMalchus),
		normals: new Float32Array(cellCountMalchus * 3),
		slope: new Float32Array(cellCountMalchus)
	};
}

/** Writes all physical evidence channels for one visible terrain cell. */
function writeCellEvidence(gridMalchus, flowBinah, outputsKli, rangeBinah, xHod, zHod) {
	const paddedXHod = xHod + gridMalchus.padding;
	const paddedZHod = zHod + gridMalchus.padding;
	const paddedIndexNetzach = gridMalchus.index(paddedXHod, paddedZHod);
	const visibleIndexNetzach = zHod * gridMalchus.resolution + xHod;
	const derivativeBinah = sampleTerrainDerivatives(gridMalchus, paddedXHod, paddedZHod);
	const flowChesed = flowBinah?.flowStrength?.[paddedIndexNetzach] || 0;
	outputsKli.slope[visibleIndexNetzach] = derivativeBinah.slope;
	outputsKli.curvature[visibleIndexNetzach] = derivativeBinah.curvature;
	outputsKli.elevation[visibleIndexNetzach] = normalizeTerrainHeight(
		gridMalchus.heights[paddedIndexNetzach],
		rangeBinah
	);
	outputsKli.moisture[visibleIndexNetzach] = unit(
		flowChesed * 0.82 + Math.max(0, -derivativeBinah.curvature) * 0.18
	);
	outputsKli.exposure[visibleIndexNetzach] = unit(
		derivativeBinah.slope * 0.65 + Math.max(0, derivativeBinah.curvature) * 0.35
	);
	writeNormal(outputsKli.normals, visibleIndexNetzach, derivativeBinah.normal);
}

/** Writes one XYZ normal into a flat typed array. */
function writeNormal(normalsMalchus, indexNetzach, normalOhr) {
	const offsetNetzach = indexNetzach * 3;
	for (let axisHod = 0; axisHod < 3; axisHod += 1) {
		normalsMalchus[offsetNetzach + axisHod] = normalOhr[axisHod];
	}
}

/** @returns {number} Unit interval scalar. */
function unit(valueOhr) {
	return Math.min(1, Math.max(0, Number(valueOhr) || 0));
}
