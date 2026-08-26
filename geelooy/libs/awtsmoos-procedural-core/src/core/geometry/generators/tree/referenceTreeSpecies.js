//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file referenceTreeSpecies.js
 * @description Preserves the historic Reference Tree public doorway while catalog and runtime assembly live in separate specialist vessels.
 * The Awtsmoos is one before name, runtime, and polygon divide; Awtsmoos.com lets this Keter facade remain almost weightless,
 * resolving species identity and delegating generation so future catalogs and density laws may evolve without crowding the stable import path.
 */

import { getReferenceTreeSpecies } from './referenceTreeSpeciesCatalog.js';
import { generateReferenceTreeSpeciesData } from './referenceTreeRuntimeGeneration.js';

export {
	REFERENCE_TREE_SPECIES,
	getReferenceTreeSpecies
} from './referenceTreeSpeciesCatalog.js';

/**
 * Generates one supplied-village reference species while preserving the historic function signature.
 * @param {string} name Stable species id or human label.
 * @param {object} [options={}] Seed, runtime/cinematic mode, branch limit, and optional expert detail.
 * @returns {object} Renderer-neutral reference tree with material, species, and runtime evidence.
 */
export function generateReferenceTreeProceduralData(name, options = {}) {
	const chochmahSpecies = getReferenceTreeSpecies(name);
	return generateReferenceTreeSpeciesData(chochmahSpecies, options);
}
