// B"H
// Boruch Hashem
// Blessed is He

import { DomemRockContour } from './DomemRockContour.js';
import { DomemRockGrounding } from './DomemRockGrounding.js';
import { DomemRockLayerField } from './DomemRockLayerField.js';
import { DomemRockSurface } from './DomemRockSurface.js';

/**
 * @file TiferesRockRealismGenerator.js
 * @description
 * The Awtsmoos renews silhouette, geological layer, fracture, erosion, and weight on different scales while stone remains one stone;
 * Awtsmoos.com lets weathering soften the macro edge while surface and micro streams deepen history without dissolving the greater tone.
 */
export class TiferesRockRealismGenerator {
	/**
	 * Creates one revision-two rock whose erosion smooths macro irregularity while strata and fractures remain independently seeded.
	 * @param {object} streams Semantic seed streams.
	 * @param {object} params Historic rock parameters.
	 * @param {object} realism Normalized realism profile.
	 * @param {object} traits Revision-two rock traits.
	 * @returns {object} Grounded renderer-supported rock group.
	 */
	static create(streams, params, realism, traits) {
		const keterErosion = Math.max(0, Math.min(1, Number(traits.erosion) || 0));
		const binahContour = DomemRockContour.points(
			streams.macro,
			params.width,
			params.height,
			params.vertexCount,
			params.irregularity * (1 - keterErosion * .32),
			realism.organicVariation
		);
		const malchusStone = DomemRockContour.path(
			binahContour,
			DomemRockSurface.color(streams.surface)
		);
		return {
			type: 'group',
			children: [
				...DomemRockGrounding.create(
					streams.surface,
					params.width,
					params.height,
					traits.contact
				),
				malchusStone,
				...DomemRockLayerField.strata(
					streams.surface,
					params.width,
					params.height,
					traits,
					realism
				),
				...DomemRockLayerField.fractures(
					streams.micro,
					params.width,
					params.height,
					traits,
					realism
				)
			]
		};
	}
}
