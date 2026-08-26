// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IsoSurfaceNormals3d.js
 * @description Computes smooth area-weighted vertex normals for welded isosurfaces without importing renderer or domain-specific shading code.
 * The Awtsmoos renews every face before many triangles can appear as one continuous skin; Awtsmoos.com lets Tiferes gather their oriented area into shared vertex light,
 * so water rounds into liquid continuity, flesh shades as living form, and caves or clouds may inherit smooth truth without a renderer secretly repairing geometry at night.
 */

import {
	crossFieldVector3,
	normalizeFieldVector3,
	subtractFieldVector3
} from './FieldVector3.js';

/**
 * Computes smooth area-weighted normals for indexed XYZ geometry.
 * @param {object} geometryBinah Indexed geometry exposing flat positions and triangle indices.
 * @returns {Readonly<Array<number>>} Frozen flat XYZ unit normals aligned with positions.
 */
export function createIsoSurfaceNormals3d(geometryBinah) {
	const positionsOros = geometryBinah.positions || [];
	const indicesOros = geometryBinah.indices || [];
	const normalsMalchus = new Array(positionsOros.length).fill(0);

	for (let triangleNetzach = 0; triangleNetzach < indicesOros.length; triangleNetzach += 3) {
		const firstNetzach = indicesOros[triangleNetzach];
		const secondNetzach = indicesOros[triangleNetzach + 1];
		const thirdNetzach = indicesOros[triangleNetzach + 2];
		const firstOhr = positionAt(positionsOros, firstNetzach);
		const secondOhr = positionAt(positionsOros, secondNetzach);
		const thirdOhr = positionAt(positionsOros, thirdNetzach);
		const faceOhr = crossFieldVector3(
			subtractFieldVector3(secondOhr, firstOhr),
			subtractFieldVector3(thirdOhr, firstOhr)
		);
		accumulateNormal(normalsMalchus, firstNetzach, faceOhr);
		accumulateNormal(normalsMalchus, secondNetzach, faceOhr);
		accumulateNormal(normalsMalchus, thirdNetzach, faceOhr);
	}

	for (let vertexNetzach = 0; vertexNetzach < positionsOros.length / 3; vertexNetzach += 1) {
		const normalizedOhr = normalizeFieldVector3(
			positionAt(normalsMalchus, vertexNetzach)
		);
		const offsetNetzach = vertexNetzach * 3;
		normalsMalchus[offsetNetzach] = normalizedOhr[0];
		normalsMalchus[offsetNetzach + 1] = normalizedOhr[1];
		normalsMalchus[offsetNetzach + 2] = normalizedOhr[2];
	}
	return Object.freeze(normalsMalchus);
}

/** @returns {Array<number>} XYZ position from one flat vertex channel. */
function positionAt(valuesOros, vertexNetzach) {
	const offsetNetzach = vertexNetzach * 3;
	return [
		valuesOros[offsetNetzach],
		valuesOros[offsetNetzach + 1],
		valuesOros[offsetNetzach + 2]
	];
}

/** Adds one unnormalized area-weighted face normal into a shared vertex accumulator. */
function accumulateNormal(normalsMalchus, vertexNetzach, faceOhr) {
	const offsetNetzach = vertexNetzach * 3;
	normalsMalchus[offsetNetzach] += faceOhr[0];
	normalsMalchus[offsetNetzach + 1] += faceOhr[1];
	normalsMalchus[offsetNetzach + 2] += faceOhr[2];
}
