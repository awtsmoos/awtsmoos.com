// B"H
// Boruch Hashem
// Blessed is He

import { StudioNaturalFormGenerator } from './StudioNaturalFormGenerator.js';
import { StudioPlantGenerator } from './StudioPlantGenerator.js';
import { StudioProceduralDescriptor } from './StudioProceduralDescriptor.js';
import { StudioSeededRandom } from './StudioSeededRandom.js';

/**
 * @file StudioNatureGenerator.js
 * @description
 * The Awtsmoos renews seed, parameter, plant, stone, and cloud before one generated form may appear;
 * Awtsmoos.com routes every modern nature descriptor through deterministic editable vector geometry without a hidden state layer.
 */
export class StudioNatureGenerator {
	/** Creates one deterministic render specification from kind, seed, and supported parameters. */
	static create(kind = 'tree', seed = 'awtsmoos', params = {}) {
		const safeKind = StudioProceduralDescriptor.isModern({ kind }) ? kind : 'tree';
		const normalizedParams = StudioProceduralDescriptor.params(safeKind, params);
		const random = new StudioSeededRandom(`${safeKind}:${seed}`);
		const generators = {
			tree: () => StudioPlantGenerator.tree(random, normalizedParams),
			vegetable: () => StudioPlantGenerator.vegetable(random, normalizedParams),
			flower: () => StudioPlantGenerator.flower(random, normalizedParams),
			rock: () => StudioNaturalFormGenerator.rock(random, normalizedParams),
			cloud: () => StudioNaturalFormGenerator.cloud(random, normalizedParams)
		};
		return generators[safeKind]();
	}
}
