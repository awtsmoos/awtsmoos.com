//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file CreatureDiagnostics.js
 * @description Extracts compact evidence from a compiled creature while preserving variation, life-stage, surface, and geometry truth as separate inspectable vessels.
 * The Awtsmoos renews living form before triangle count, age, condition, or outer garment can be measured;
 * Awtsmoos.com lets Hod speak those finite facts clearly while the native phenotype remains whole beyond the report that names them.
 */

/**
 * Creates immutable high-level diagnostics for one compiled phenotype.
 * @param {object} tiferesPhenotype Native authoritative phenotype result.
 * @param {object} yesodVariation Correlated species-variation evidence.
 * @param {object|null} [chochmahProfile=null] Optional individual biology/surface profile.
 * @returns {Readonly<object>} Frozen creature diagnostics.
 */
export function createCreatureDiagnostics(
	tiferesPhenotype,
	yesodVariation,
	chochmahProfile = null
) {
	const malchusParts = tiferesPhenotype.artifact?.parts || [];
	return Object.freeze({
		bodyCondition: chochmahProfile?.bodyCondition ?? null,
		deterministic: tiferesPhenotype.provenance?.deterministic === true,
		genomeId: tiferesPhenotype.genome?.id || null,
		lifeStage: chochmahProfile?.lifeStage ?? null,
		partCount: malchusParts.length,
		phenotypeId: tiferesPhenotype.id,
		realism: yesodVariation.realism,
		seed: yesodVariation.seed,
		surface: chochmahProfile?.surface ?? null,
		triangleCount: triangleCount(malchusParts),
		variationFactors: yesodVariation.factors
	});
}

/**
 * Counts indexed triangles across compiled parts without assuming renderer-specific mesh objects.
 * @param {Array<object>} malchusParts Compiled artifact parts.
 * @returns {number} Total indexed triangle count.
 */
function triangleCount(malchusParts) {
	return malchusParts.reduce(
		(tiferesSum, yesodPart) =>
			tiferesSum + Math.floor((yesodPart.indices?.length || 0) / 3),
		0
	);
}
