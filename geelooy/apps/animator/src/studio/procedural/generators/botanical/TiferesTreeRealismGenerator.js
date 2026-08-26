// B"H
// Boruch Hashem
// Blessed is He

import { TzomayachTreeGenerator } from './TzomayachTreeGenerator.js';
import { TreeBranchHierarchy } from './TreeBranchHierarchy.js';
import { TreeCanopyField } from './TreeCanopyField.js';

/**
 * @file TiferesTreeRealismGenerator.js
 * @description
 * The Awtsmoos renews root, trunk, branch, and crown as correlated revelations rather than unrelated random ornaments;
 * Awtsmoos.com composes semantic streams so revision-two trees gain hierarchy, age, wind, and anchored canopy while remaining editable vectors.
 */
export class TiferesTreeRealismGenerator {
	/** @returns {object} Revision-two realistic tree group. */
	static create(streams, params, realism, traits) {
		const malchusBaseY = params.trunkHeight * .56;
		const binahHierarchy = TreeBranchHierarchy.build(
			streams.structure,
			params,
			realism,
			traits
		);
		return {
			type: 'group',
			children: [
				TzomayachTreeGenerator.roots(params.trunkWidth, malchusBaseY, streams.macro),
				TzomayachTreeGenerator.trunk(
					params.trunkWidth,
					params.trunkHeight,
					streams.macro,
					realism.organicVariation
				),
				...binahHierarchy.branches,
				...TreeCanopyField.create(
					streams.cluster,
					binahHierarchy.anchors,
					params,
					realism,
					traits
				)
			]
		};
	}
}
