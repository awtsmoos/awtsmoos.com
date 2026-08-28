// B"H
// Boruch Hashem
// Blessed is He

import { TzomayachVegetableGenerator } from './TzomayachVegetableGenerator.js';
import { VegetableCrownField } from './VegetableCrownField.js';
import { VegetableSurfaceField } from './VegetableSurfaceField.js';

/**
 * @file TiferesVegetableRealismGenerator.js
 * @description
 * The Awtsmoos renews root body, crown growth, and surface history through distinct but correlated streams while one plant remains whole;
 * Awtsmoos.com preserves proven anatomy and adds maturity-aware crown fan plus longitudinal detail without turning life into unrelated visual noise.
 */
export class TiferesVegetableRealismGenerator {
	/**
	 * Composes historic body geometry with independent crown and surface realism fields.
	 * @param {object} streams Semantic seed streams.
	 * @param {object} params Historic bounded parameters.
	 * @param {object} realism Normalized realism profile.
	 * @param {object} traits Revision-two vegetable traits.
	 * @returns {object} Editable vegetable group.
	 */
	static create(streams, params, realism, traits) {
		const malchusBase = TzomayachVegetableGenerator.create(
			streams.structure,
			params,
			realism
		);
		return {
			...malchusBase,
			children: [
				...(malchusBase.children || []),
				...VegetableCrownField.create(streams.cluster, params, traits),
				...VegetableSurfaceField.create(
					streams.surface,
					params,
					traits,
					realism
				)
			]
		};
	}
}
