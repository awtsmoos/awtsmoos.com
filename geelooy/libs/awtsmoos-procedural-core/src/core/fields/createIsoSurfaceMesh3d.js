// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createIsoSurfaceMesh3d.js
 * @description Composes generic extraction, topology welding, and smooth normal generation into one renderer-neutral implicit-surface mesh doorway.
 * The Awtsmoos renews hidden field, crossing, shared vertex, and normal before one mesh can appear complete; Awtsmoos.com lets Tiferes gather each focused vessel without erasing its law,
 * so liquid, flesh, cloud, cave, and future scalar worlds receive smooth indexed geometry while advanced callers may still access every stage beneath the revealed surface glow.
 */

import { extractIsoSurface3d } from './IsoSurfaceExtractor3d.js';
import { createIsoSurfaceNormals3d } from './IsoSurfaceNormals3d.js';
import { weldIsoSurface3d } from './IsoSurfaceWeld3d.js';

/**
 * Creates one smooth indexed isosurface mesh from any ScalarField3d-compatible field.
 * @param {object} fieldYesod Scalar field authority.
 * @param {object} [optionsChesed={}] Resolution and weld-tolerance options.
 * @returns {Readonly<object>} Frozen positions, normals, indices, and extraction/weld diagnostics.
 */
export function createIsoSurfaceMesh3d(
	fieldYesod,
	optionsChesed = {}
) {
	const soupBinah = extractIsoSurface3d(
		fieldYesod,
		optionsChesed
	);
	const weldedBinah = weldIsoSurface3d(
		soupBinah,
		{
			tolerance: optionsChesed.weldTolerance
		}
	);
	const normalsOros = createIsoSurfaceNormals3d(weldedBinah);
	return Object.freeze({
		cells: soupBinah.cells,
		diagnostics: Object.freeze({
			reductionRatio: weldedBinah.reductionRatio,
			sourceVertexCount: weldedBinah.sourceVertexCount,
			triangleCount: soupBinah.triangleCount,
			vertexCount: weldedBinah.vertexCount
		}),
		fieldLabel: soupBinah.fieldLabel,
		indices: weldedBinah.indices,
		inside: soupBinah.inside,
		isoValue: soupBinah.isoValue,
		normals: normalsOros,
		positions: weldedBinah.positions,
		resolution: soupBinah.resolution,
		type: 'scalar-field.iso-surface-mesh'
	});
}
