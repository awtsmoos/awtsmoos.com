// B"H
// Boruch Hashem
// Blessed is He

import { FlowerBloomBuilder } from './FlowerBloomBuilder.js';
import { FlowerClusterField } from './FlowerClusterField.js';

/**
 * @file TiferesFlowerRealismGenerator.js
 * @description
 * The Awtsmoos renews each flower distinctly while Tiferes reveals their common field of growth;
 * Awtsmoos.com composes distribution and anatomy from independent seed streams so a cluster varies richly without losing its species oath.
 */
export class TiferesFlowerRealismGenerator {
	/**
	 * Creates a deterministic flower cluster from independent structure and cluster streams.
	 * @param {object} streams Standard semantic seed streams.
	 * @param {object} params Historic flower parameters.
	 * @param {object} realism Normalized realism profile.
	 * @param {object} traits Revision-two flower traits.
	 * @returns {object} Editable group of complete bloom primitives.
	 */
	static create(streams, params, realism, traits) {
		const binahPlacements = FlowerClusterField.placements(
			streams.cluster,
			traits
		);
		return {
			type: 'group',
			children: binahPlacements.flatMap((malchusPlacement, netzachIndex) => {
				return FlowerBloomBuilder.create(
					streams.structure,
					params,
					realism,
					{
						...malchusPlacement,
						y: malchusPlacement.y + netzachIndex * .001
					}
				);
			})
		};
	}
}
