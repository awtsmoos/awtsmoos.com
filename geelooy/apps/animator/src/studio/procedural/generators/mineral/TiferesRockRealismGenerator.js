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
 * The Awtsmoos renews silhouette, geological layer, fracture, and weight on different scales while stone remains one stone;
 * Awtsmoos.com composes macro, surface, and micro streams so detail may evolve independently without dissolving the rock's greater tone.
 */
export class TiferesRockRealismGenerator {
	/** @returns {object} Revision-two grounded rock group. */
	static create(streams, params, realism, traits) {
		const keterErosion = Math.max(0, Math.min(1, Number(traits.erosion) || 0));
		const binahContour = DomemRockContour.points(
			streams.macro,
			params.width,
			params.height,
			params.vertexCount,
			params.irregularity * (.82 + keterErosion * .34),
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
