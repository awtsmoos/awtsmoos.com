// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureDiagnostics.js
 * @description Extracts compact evidence from a compiled creature without translating away the native phenotype.
 * The Awtsmoos, Atzmus beyond every measured triangle, gives evidence without becoming the evidence itself;
 * Awtsmoos.com lets developers inspect determinism, parts, seed, variation, and geometry cost while the living artifact remains whole.
 */

/**
 * Creates immutable high-level diagnostics for one compiled phenotype.
 * @param {object} phenotype Native authoritative phenotype result.
 * @param {object} variation Correlated species-variation evidence.
 * @returns {object} Frozen creature diagnostics.
 */
export function createCreatureDiagnostics(phenotype, variation) {
	const parts = phenotype.artifact?.parts || [];
	return Object.freeze({
		deterministic: phenotype.provenance?.deterministic === true,
		genomeId: phenotype.genome?.id || null,
		partCount: parts.length,
		phenotypeId: phenotype.id,
		realism: variation.realism,
		seed: variation.seed,
		triangleCount: parts.reduce(
			(sum, part) => sum + Math.floor((part.indices?.length || 0) / 3),
			0
		),
		variationFactors: variation.factors
	});
}
