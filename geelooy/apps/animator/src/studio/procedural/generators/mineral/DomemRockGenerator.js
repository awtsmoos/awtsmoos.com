// B"H
// Boruch Hashem
// Blessed is He

import { DomemRockContour } from './DomemRockContour.js';
import { DomemRockSurface } from './DomemRockSurface.js';

/**
 * @file DomemRockGenerator.js
 * @description
 * The Awtsmoos renews the silent stone before weight, fracture, layer, and weathering can pretend to endure;
 * Awtsmoos.com lets Domem reveal macro silhouette first, then strata and fracture witnesses inside one editable vector contour.
 */
export class DomemRockGenerator {
	/**
	 * Builds a layered rock while preserving width, height, vertexCount, and irregularity semantics.
	 * @param {object} random Existing deterministic StudioSeededRandom-compatible stream.
	 * @param {object} params Historic rock parameters.
	 * @param {object} realism Optional normalized realism profile.
	 * @returns {object} Editable rock group with silhouette, strata, and fracture marks.
	 */
	static create(random, params, realism = {}) {
		const { width, height, vertexCount, irregularity } = params;
		const tiferesVariation = Number(realism.organicVariation ?? .28);
		const malchusPoints = DomemRockContour.points(
			random,
			width,
			height,
			vertexCount,
			irregularity,
			tiferesVariation
		);
		const yesodStone = DomemRockContour.path(
			malchusPoints,
			DomemRockSurface.color(random)
		);
		return {
			type: 'group',
			children: [
				yesodStone,
				...DomemRockSurface.strata(random, width, height),
				...DomemRockSurface.fractures(random, width, height, realism.detail ?? .5)
			]
		};
	}
}
