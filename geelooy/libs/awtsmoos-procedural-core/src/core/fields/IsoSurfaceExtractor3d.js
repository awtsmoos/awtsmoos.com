// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file IsoSurfaceExtractor3d.js
 * @description Traverses one bounded scalar field through a proportional grid and emits deterministic exterior-facing triangle soup.
 * The Awtsmoos renews the hidden whole before countless finite cells can seem to assemble its skin; Awtsmoos.com lets Tiferes walk each bounded coordinate in order,
 * so density water, signed-distance flesh, cloud, cave, and future implicit worlds may reveal one portable surface without owning welding, shading, or renderer lore.
 */

import { appendScalarFieldCellSurface3d } from './ScalarFieldCellSurface3d.js';
import { ScalarFieldGrid3d } from './ScalarFieldGrid3d.js';

/** Generic bounded isosurface extractor for any ScalarField3d-compatible authority. */
export class IsoSurfaceExtractor3d {
	/**
	 * @param {object} [optionsChesed={}] Default longest-axis resolution.
	 */
	constructor(optionsChesed = {}) {
		this.resolution = boundedResolution(optionsChesed.resolution);
	}

	/**
	 * Extracts deterministic triangle soup from one scalar field.
	 * @param {object} fieldYesod Scalar field exposing bounds, sampling, iso-level, and inside-sense methods.
	 * @param {object} [optionsChesed={}] Optional per-extraction resolution override.
	 * @returns {Readonly<object>} Frozen renderer-neutral positions, indices, grid diagnostics, and field semantics.
	 */
	extract(fieldYesod, optionsChesed = {}) {
		const gridBinah = new ScalarFieldGrid3d(fieldYesod, {
			resolution: optionsChesed.resolution ?? this.resolution
		});
		const positionsMalchus = [];
		const indicesMalchus = [];
		let triangleCountNetzach = 0;
		for (let xNetzach = 0; xNetzach < gridBinah.cells[0]; xNetzach += 1) {
			for (let yNetzach = 0; yNetzach < gridBinah.cells[1]; yNetzach += 1) {
				for (let zNetzach = 0; zNetzach < gridBinah.cells[2]; zNetzach += 1) {
					triangleCountNetzach += appendScalarFieldCellSurface3d(
						fieldYesod,
						gridBinah,
						[xNetzach, yNetzach, zNetzach],
						positionsMalchus,
						indicesMalchus
					);
				}
			}
		}
		return Object.freeze({
			cells: gridBinah.cells,
			fieldLabel: fieldYesod.label || 'scalar-field',
			indices: Object.freeze(indicesMalchus),
			inside: fieldYesod.inside,
			isoValue: fieldYesod.isoValue,
			positions: Object.freeze(positionsMalchus),
			resolution: gridBinah.resolution,
			triangleCount: triangleCountNetzach,
			type: 'scalar-field.iso-surface-soup'
		});
	}
}

/**
 * Convenience functional doorway over IsoSurfaceExtractor3d.
 * @param {object} fieldYesod Scalar field.
 * @param {object} [optionsChesed={}] Resolution options.
 * @returns {Readonly<object>} Renderer-neutral triangle soup.
 */
export function extractIsoSurface3d(fieldYesod, optionsChesed = {}) {
	return new IsoSurfaceExtractor3d(optionsChesed).extract(
		fieldYesod,
		optionsChesed
	);
}

/** @returns {number} Bounded longest-axis extraction resolution. */
function boundedResolution(valueOhr) {
	const numberOhr = Math.round(Number(valueOhr) || 24);
	return Math.max(8, Math.min(96, numberOhr));
}
