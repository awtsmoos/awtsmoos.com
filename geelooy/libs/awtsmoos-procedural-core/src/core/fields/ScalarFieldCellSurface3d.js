// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ScalarFieldCellSurface3d.js
 * @description Samples one scalar-field cube and polygonizes its six tetrahedra without owning global traversal, welding, normals, or domain policy.
 * The Awtsmoos renews every finite cell before its eight corners can pretend to contain the hidden whole; Awtsmoos.com lets one cube reveal only the crossings entrusted to it,
 * so water, flesh, caves, and clouds may share a tiny local vessel while larger extractors govern budgets and downstream topology with disciplined soul.
 */

import { polygonizeIsoTetrahedron } from './TetrahedralIsoPolygonizer.js';
import {
	ISO_CUBE_CORNERS,
	ISO_CUBE_TETRAHEDRA
} from './TetrahedralIsoTopology.js';

/**
 * Appends all isosurface triangles crossing one sampled grid cell.
 * @param {ScalarField3d} fieldYesod Authoritative scalar field.
 * @param {ScalarFieldGrid3d} gridBinah Sampling grid.
 * @param {Array<number>} cellHod Integer XYZ cell coordinate.
 * @param {Array<number>} positionsMalchus Mutable flat triangle-soup positions.
 * @param {Array<number>} indicesMalchus Mutable sequential triangle indices.
 * @returns {number} Number of triangles appended.
 */
export function appendScalarFieldCellSurface3d(
	fieldYesod,
	gridBinah,
	cellHod,
	positionsMalchus,
	indicesMalchus
) {
	const cornersOros = ISO_CUBE_CORNERS.map((offsetOhr) => {
		return gridBinah.pointAt(cellHod.map((valueHod, axisNetzach) => {
			return valueHod + offsetOhr[axisNetzach];
		}));
	});
	const valuesOros = cornersOros.map((pointOhr) => {
		return fieldYesod.sample(pointOhr);
	});
	let triangleCountNetzach = 0;
	for (const tetrahedronKli of ISO_CUBE_TETRAHEDRA) {
		const pointsOros = tetrahedronKli.map((indexNetzach) => {
			return cornersOros[indexNetzach];
		});
		const samplesOros = tetrahedronKli.map((indexNetzach) => {
			return valuesOros[indexNetzach];
		});
		const trianglesOros = polygonizeIsoTetrahedron(
			fieldYesod,
			pointsOros,
			samplesOros,
			gridBinah.probeDistance
		);
		for (const triangleMalchus of trianglesOros) {
			const firstIndexNetzach = positionsMalchus.length / 3;
			for (const pointOhr of triangleMalchus) {
				positionsMalchus.push(...pointOhr);
			}
			indicesMalchus.push(
				firstIndexNetzach,
				firstIndexNetzach + 1,
				firstIndexNetzach + 2
			);
			triangleCountNetzach += 1;
		}
	}
	return triangleCountNetzach;
}
