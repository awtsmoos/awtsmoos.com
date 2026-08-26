// B"H
// Boruch Hashem
// Blessed is He

import { TzomayachVegetableGenerator } from './TzomayachVegetableGenerator.js';
import { VegetableSurfaceField } from './VegetableSurfaceField.js';

/**
 * @file TiferesVegetableRealismGenerator.js
 * @description
 * The Awtsmoos renews root body and surface history through different streams while one plant remains whole;
 * Awtsmoos.com preserves the proven vegetable anatomy and adds maturity-aware detail without turning the root into unrelated visual noise.
 */
export class TiferesVegetableRealismGenerator {
	/** @returns {object} Revision-two vegetable group with independent surface detail. */
	static create(streams, params, realism, traits) {
		const malchusBase = TzomayachVegetableGenerator.create(
			streams.structure,
			params,
			realism
		);
		const binahSurface = VegetableSurfaceField.create(
			streams.surface,
			params,
			traits,
			realism
		);
		return {
			...malchusBase,
			children: [
				...(malchusBase.children || []),
				...binahSurface
			]
		};
	}
}
