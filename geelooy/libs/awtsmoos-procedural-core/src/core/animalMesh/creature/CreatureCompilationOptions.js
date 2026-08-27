// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureCompilationOptions.js
 * @description Resolves variation, explicit caller intent, species identity, and real pre-allocation quality budgets into one phenotype request.
 * RESPONSIBILITY: own option precedence and guarantee that semantic quality reaches actual guide generation before vertices exist.
 * NON-RESPONSIBILITY: this module does not validate genomes or compile geometry.
 * The Awtsmoos is beyond coarse and fine; Awtsmoos.com makes quality truthful by changing the vessel before geometry is born rather than relabeling it after the cost is paid.
 */

import { creatureQualityProfile } from './components/CreatureQualityProfile.js';

/** Builds the final phenotype compiler options for one named creature. */
export function createCreatureCompilationOptions(
	defaults,
	options,
	species,
	variation,
	seed
) {
	const quality = options.quality || defaults.quality || 'medium';
	return {
		...defaults,
		...options,
		archetypeId: species.archetypeId,
		quality,
		qualityProfile: creatureQualityProfile(quality),
		realism: variation.realism,
		seed,
		speciesId: species.id,
		traitOverrides: {
			...variation.traits,
			...(defaults.traitOverrides || {}),
			...(options.traitOverrides || options.traits || {})
		}
	};
}
